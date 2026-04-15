package com.example.inventory.service;

import com.example.inventory.dto.WishlistItemResponse;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.Product;
import com.example.inventory.model.WishlistItem;
import com.example.inventory.repository.ProductReviewRepository;
import com.example.inventory.repository.WishlistItemRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final CustomerAccountService customerAccountService;
    private final ProductService productService;
    private final ProductReviewRepository productReviewRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository,
                           CustomerAccountService customerAccountService,
                           ProductService productService,
                           ProductReviewRepository productReviewRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.customerAccountService = customerAccountService;
        this.productService = productService;
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(String username) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        return wishlistItemRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public WishlistItemResponse addToWishlist(String username, Long productId) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        Product product = productService.findProductEntity(productId);

        if (!product.isActive()) {
            throw new BusinessValidationException("Only active products can be saved to the wishlist.");
        }

        WishlistItem wishlistItem = wishlistItemRepository.findByCustomerIdAndProductId(customer.getId(), productId)
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setCustomer(customer);
                    item.setProduct(product);
                    return wishlistItemRepository.save(item);
                });

        return mapToResponse(wishlistItem);
    }

    @Transactional
    public void removeFromWishlist(String username, Long productId) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        wishlistItemRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
    }

    private WishlistItemResponse mapToResponse(WishlistItem wishlistItem) {
        Product product = wishlistItem.getProduct();
        WishlistItemResponse response = new WishlistItemResponse();
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setCategoryName(product.getCategory().getName());
        response.setImageUrl(product.getImageUrl());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setAvailable(product.isActive() && product.getStockQuantity() > 0);
        response.setAverageRating(roundRating(productReviewRepository.findAverageRatingByProductId(product.getId())));
        response.setSavedAt(wishlistItem.getCreatedAt());
        return response;
    }

    private Double roundRating(Double rating) {
        if (rating == null) {
            return 0.0;
        }
        return Math.round(rating * 10.0) / 10.0;
    }
}

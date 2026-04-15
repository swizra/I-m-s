package com.example.inventory.service;

import com.example.inventory.dto.ProductReviewRequest;
import com.example.inventory.dto.ProductReviewResponse;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductReview;
import com.example.inventory.repository.ProductReviewRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final CustomerAccountService customerAccountService;
    private final ProductService productService;

    public ProductReviewService(ProductReviewRepository productReviewRepository,
                                CustomerAccountService customerAccountService,
                                ProductService productService) {
        this.productReviewRepository = productReviewRepository;
        this.customerAccountService = customerAccountService;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public List<ProductReviewResponse> getReviewsForProduct(Long productId) {
        productService.findProductEntity(productId);
        return productReviewRepository.findByProductIdOrderByUpdatedAtDesc(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductReviewResponse> getReviewsForCustomer(String username) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        return productReviewRepository.findByCustomerIdOrderByUpdatedAtDesc(customer.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductReviewResponse upsertReview(String username, Long productId, ProductReviewRequest request) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        Product product = productService.findProductEntity(productId);

        ProductReview review = productReviewRepository.findByProductIdAndCustomerId(productId, customer.getId())
                .orElseGet(() -> {
                    ProductReview newReview = new ProductReview();
                    newReview.setCustomer(customer);
                    newReview.setProduct(product);
                    return newReview;
                });

        review.setRating(request.getRating());
        review.setTitle(normalizeTitle(request.getTitle()));
        review.setComment(request.getComment().trim());

        return mapToResponse(productReviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(String username, Long productId) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        productReviewRepository.findByProductIdAndCustomerId(productId, customer.getId())
                .ifPresent(productReviewRepository::delete);
    }

    private String normalizeTitle(String title) {
        if (title == null || title.isBlank()) {
            return null;
        }
        return title.trim();
    }

    private ProductReviewResponse mapToResponse(ProductReview review) {
        ProductReviewResponse response = new ProductReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        response.setCustomerUsername(review.getCustomer().getUsername());
        response.setRating(review.getRating());
        response.setTitle(review.getTitle());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}

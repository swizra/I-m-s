package com.example.inventory.controller;

import com.example.inventory.dto.CustomerCheckoutRequest;
import com.example.inventory.dto.CustomerOrderResponse;
import com.example.inventory.dto.CustomerProfileResponse;
import com.example.inventory.dto.CustomerProfileUpdateRequest;
import com.example.inventory.dto.ProductReviewRequest;
import com.example.inventory.dto.ProductReviewResponse;
import com.example.inventory.dto.WishlistItemResponse;
import com.example.inventory.service.AuthService;
import com.example.inventory.service.CustomerAccountService;
import com.example.inventory.service.CustomerOrderService;
import com.example.inventory.service.ProductReviewService;
import com.example.inventory.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@Tag(name = "Customer Account", description = "Protected endpoints for customer profile, wishlist, reviews, and orders.")
@SecurityRequirement(name = "bearerAuth")
public class CustomerAccountController {

    private final AuthService authService;
    private final CustomerAccountService customerAccountService;
    private final CustomerOrderService customerOrderService;
    private final WishlistService wishlistService;
    private final ProductReviewService productReviewService;

    public CustomerAccountController(AuthService authService,
                                     CustomerAccountService customerAccountService,
                                     CustomerOrderService customerOrderService,
                                     WishlistService wishlistService,
                                     ProductReviewService productReviewService) {
        this.authService = authService;
        this.customerAccountService = customerAccountService;
        this.customerOrderService = customerOrderService;
        this.wishlistService = wishlistService;
        this.productReviewService = productReviewService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated customer's profile")
    public CustomerProfileResponse getProfile(Authentication authentication) {
        return customerAccountService.getCustomerProfile(authService.extractUsername(authentication));
    }

    @PutMapping("/me")
    @Operation(summary = "Update the authenticated customer's profile")
    public CustomerProfileResponse updateProfile(Authentication authentication,
                                                 @Valid @RequestBody CustomerProfileUpdateRequest request) {
        return customerAccountService.updateCustomerProfile(authService.extractUsername(authentication), request);
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete the authenticated customer's account")
    public ResponseEntity<Void> deleteProfile(Authentication authentication) {
        customerAccountService.deleteCustomerProfile(authService.extractUsername(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/wishlist")
    @Operation(summary = "Get the authenticated customer's wishlist")
    public List<WishlistItemResponse> getWishlist(Authentication authentication) {
        return wishlistService.getWishlist(authService.extractUsername(authentication));
    }

    @PostMapping("/wishlist/{productId}")
    @Operation(summary = "Save a product to the authenticated customer's wishlist")
    public ResponseEntity<WishlistItemResponse> addToWishlist(Authentication authentication, @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(authService.extractUsername(authentication), productId));
    }

    @DeleteMapping("/wishlist/{productId}")
    @Operation(summary = "Remove a product from the authenticated customer's wishlist")
    public ResponseEntity<Void> removeFromWishlist(Authentication authentication, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(authService.extractUsername(authentication), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get the authenticated customer's submitted reviews")
    public List<ProductReviewResponse> getMyReviews(Authentication authentication) {
        return productReviewService.getReviewsForCustomer(authService.extractUsername(authentication));
    }

    @PutMapping("/reviews/{productId}")
    @Operation(summary = "Create or update a product review")
    public ProductReviewResponse upsertReview(Authentication authentication,
                                             @PathVariable Long productId,
                                             @Valid @RequestBody ProductReviewRequest request) {
        return productReviewService.upsertReview(authService.extractUsername(authentication), productId, request);
    }

    @DeleteMapping("/reviews/{productId}")
    @Operation(summary = "Delete the authenticated customer's product review")
    public ResponseEntity<Void> deleteReview(Authentication authentication, @PathVariable Long productId) {
        productReviewService.deleteReview(authService.extractUsername(authentication), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    @Operation(summary = "Get the authenticated customer's order history")
    public List<CustomerOrderResponse> getOrders(Authentication authentication) {
        return customerOrderService.getOrdersForCustomer(authService.extractUsername(authentication));
    }

    @GetMapping("/orders/{orderNumber}")
    @Operation(summary = "Get one order for the authenticated customer")
    public CustomerOrderResponse getOrder(Authentication authentication, @PathVariable String orderNumber) {
        return customerOrderService.getOrderForCustomer(authService.extractUsername(authentication), orderNumber);
    }

    @PostMapping("/orders")
    @Operation(
            summary = "Place a new order",
            description = "Example request: {\"items\":[{\"productId\":1,\"quantity\":1},{\"productId\":8,\"quantity\":2}],\"deliveryAddress\":\"Campus pickup desk, Building 5\",\"note\":\"Please prepare before 4 PM.\"}"
    )
    @ApiResponse(responseCode = "201", description = "Order placed")
    public ResponseEntity<CustomerOrderResponse> placeOrder(Authentication authentication,
                                                            @Valid @RequestBody CustomerCheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerOrderService.placeOrder(authService.extractUsername(authentication), request));
    }
}

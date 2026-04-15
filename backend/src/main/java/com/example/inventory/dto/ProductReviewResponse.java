package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Customer review returned for a product.")
public class ProductReviewResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "1")
    private Long productId;

    @Schema(example = "Petting Shampoo")
    private String productName;

    @Schema(example = "lina")
    private String customerUsername;

    @Schema(example = "5")
    private Integer rating;

    @Schema(example = "Perfect for dry hair")
    private String title;

    @Schema(example = "Smells lovely and feels gentle enough for daily use.")
    private String comment;

    @Schema(example = "2026-03-23T09:15:00")
    private LocalDateTime createdAt;

    @Schema(example = "2026-03-23T09:15:00")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCustomerUsername() {
        return customerUsername;
    }

    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

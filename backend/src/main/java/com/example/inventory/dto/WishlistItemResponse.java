package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Saved customer wishlist item.")
public class WishlistItemResponse {

    @Schema(example = "1")
    private Long productId;

    @Schema(example = "Petting Shampoo")
    private String productName;

    @Schema(example = "Hair Care")
    private String categoryName;

    @Schema(example = "https://placehold.co/600x400?text=Petting+Shampoo")
    private String imageUrl;

    @Schema(example = "18.90")
    private BigDecimal price;

    @Schema(example = "10")
    private Integer stockQuantity;

    @Schema(example = "true")
    private Boolean available;

    @Schema(example = "4.5")
    private Double averageRating;

    @Schema(example = "2026-03-23T09:25:00")
    private LocalDateTime savedAt;

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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}

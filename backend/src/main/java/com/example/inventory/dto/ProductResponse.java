package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Product data returned by the API.")
public class ProductResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Wireless Keyboard")
    private String name;

    @Schema(example = "Compact keyboard suitable for office and study.")
    private String description;

    @Schema(example = "29.90")
    private BigDecimal price;

    @Schema(example = "25")
    private Integer stockQuantity;

    @Schema(example = "https://placehold.co/600x400?text=Keyboard")
    private String imageUrl;

    @Schema(example = "KEFE-HAIR-001")
    private String sku;

    @Schema(example = "7612345678901")
    private String barcode;

    @Schema(example = "6")
    private Integer restockThreshold;

    @Schema(example = "true")
    private Boolean active;

    @Schema(example = "true")
    private Boolean available;

    @Schema(example = "In Stock")
    private String stockStatus;

    @Schema(example = "1")
    private Long categoryId;

    @Schema(example = "Electronics")
    private String categoryName;

    @Schema(example = "4")
    private Long reviewCount;

    @Schema(example = "4.5")
    private Double averageRating;

    @Schema(example = "2026-03-24T09:15:00")
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public Integer getRestockThreshold() {
        return restockThreshold;
    }

    public void setRestockThreshold(Integer restockThreshold) {
        this.restockThreshold = restockThreshold;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

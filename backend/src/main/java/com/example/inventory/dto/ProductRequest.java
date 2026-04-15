package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Schema(description = "Request body for creating or updating a product.")
public class ProductRequest {

    @NotBlank(message = "Product name is required.")
    @Size(max = 120, message = "Product name must not exceed 120 characters.")
    @Schema(example = "Wireless Keyboard")
    private String name;

    @NotBlank(message = "Product description is required.")
    @Size(max = 1000, message = "Product description must not exceed 1000 characters.")
    @Schema(example = "Compact keyboard suitable for office and study.")
    private String description;

    @NotNull(message = "Price is required.")
    @DecimalMin(value = "0.01", message = "Product price must be greater than 0.")
    @Schema(example = "29.90")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required.")
    @PositiveOrZero(message = "Stock quantity cannot be negative.")
    @Schema(example = "25")
    private Integer stockQuantity;

    @NotBlank(message = "Image URL is required.")
    @Size(max = 1000, message = "Image URL must not exceed 1000 characters.")
    @Schema(example = "https://placehold.co/600x400?text=Keyboard")
    private String imageUrl;

    @NotBlank(message = "SKU is required.")
    @Size(max = 64, message = "SKU must not exceed 64 characters.")
    @Schema(example = "KEFE-HAIR-001")
    private String sku;

    @Size(max = 64, message = "Barcode must not exceed 64 characters.")
    @Schema(example = "7612345678901")
    private String barcode;

    @NotNull(message = "Restock threshold is required.")
    @PositiveOrZero(message = "Restock threshold cannot be negative.")
    @Schema(example = "6")
    private Integer restockThreshold;

    @NotNull(message = "Active flag is required.")
    @Schema(example = "true")
    private Boolean active;

    @NotNull(message = "Category ID is required.")
    @Schema(example = "1")
    private Long categoryId;

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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}

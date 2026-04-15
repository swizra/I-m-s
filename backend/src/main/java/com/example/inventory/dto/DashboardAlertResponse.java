package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Low-stock alert with a suggested restock amount.")
public class DashboardAlertResponse {

    @Schema(example = "1")
    private Long productId;

    @Schema(example = "KEFE-HAIR-001")
    private String sku;

    @Schema(example = "Petting Shampoo")
    private String productName;

    @Schema(example = "Hair Care")
    private String categoryName;

    @Schema(example = "2")
    private Integer stockQuantity;

    @Schema(example = "6")
    private Integer restockThreshold;

    @Schema(example = "10")
    private Integer suggestedRestockQuantity;

    @Schema(example = "high")
    private String severity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
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

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getRestockThreshold() {
        return restockThreshold;
    }

    public void setRestockThreshold(Integer restockThreshold) {
        this.restockThreshold = restockThreshold;
    }

    public Integer getSuggestedRestockQuantity() {
        return suggestedRestockQuantity;
    }

    public void setSuggestedRestockQuantity(Integer suggestedRestockQuantity) {
        this.suggestedRestockQuantity = suggestedRestockQuantity;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}

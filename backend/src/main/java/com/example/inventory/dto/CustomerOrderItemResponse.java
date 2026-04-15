package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "A single order item in a customer order response.")
public class CustomerOrderItemResponse {

    @Schema(example = "1")
    private Long productId;

    @Schema(example = "Student Laptop")
    private String productName;

    @Schema(example = "Hair Care")
    private String categoryName;

    @Schema(example = "https://placehold.co/600x400?text=Student+Laptop")
    private String imageUrl;

    @Schema(example = "1")
    private Integer quantity;

    @Schema(example = "899.00")
    private BigDecimal unitPrice;

    @Schema(example = "899.00")
    private BigDecimal lineTotal;

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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }
}

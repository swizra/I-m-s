package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "A single cart line for checkout.")
public class CustomerCheckoutItemRequest {

    @NotNull(message = "Product ID is required.")
    @Schema(example = "1")
    private Long productId;

    @NotNull(message = "Quantity is required.")
    @Positive(message = "Quantity must be greater than 0.")
    @Schema(example = "2")
    private Integer quantity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for updating stock quantity.")
public class StockUpdateRequest {

    @NotNull(message = "New stock quantity is required.")
    @PositiveOrZero(message = "Stock quantity cannot be negative.")
    @Schema(example = "10")
    private Integer newStockQuantity;

    @Size(max = 250, message = "Note must not exceed 250 characters.")
    @Schema(example = "Restocked after weekly supplier delivery.")
    private String note;

    public Integer getNewStockQuantity() {
        return newStockQuantity;
    }

    public void setNewStockQuantity(Integer newStockQuantity) {
        this.newStockQuantity = newStockQuantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}

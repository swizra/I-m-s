package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for changing an order status.")
public class AdminOrderStatusUpdateRequest {

    @NotBlank(message = "Status is required.")
    @Schema(example = "PREPARING")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

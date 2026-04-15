package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

@Schema(description = "Checkout request for placing a customer order.")
public class CustomerCheckoutRequest {

    @Valid
    @NotEmpty(message = "At least one cart item is required.")
    private List<CustomerCheckoutItemRequest> items;

    @NotBlank(message = "Pickup or delivery details are required.")
    @Size(max = 300, message = "Pickup or delivery details must not exceed 300 characters.")
    @Schema(example = "Campus pickup desk, Building 5")
    private String deliveryAddress;

    @Size(max = 300, message = "Order note must not exceed 300 characters.")
    @Schema(example = "Please prepare before 4 PM.")
    private String note;

    public List<CustomerCheckoutItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CustomerCheckoutItemRequest> items) {
        this.items = items;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}

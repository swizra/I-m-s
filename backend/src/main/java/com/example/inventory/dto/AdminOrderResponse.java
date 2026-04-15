package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Compact order information for the admin dashboard.")
public class AdminOrderResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "KEFE-20260322-170434-869")
    private String orderNumber;

    @Schema(example = "Lina Meyer")
    private String customerFullName;

    @Schema(example = "lina")
    private String customerUsername;

    @Schema(example = "PLACED")
    private String status;

    @Schema(example = "51.60")
    private BigDecimal totalAmount;

    @Schema(example = "3")
    private int itemCount;

    @Schema(example = "Campus pickup desk, Building 5")
    private String deliveryAddress;

    @Schema(example = "Please prepare before 4 PM.")
    private String note;

    @Schema(example = "2026-03-22T17:04:34")
    private LocalDateTime createdAt;

    @Schema(example = "2026-03-22T18:19:34")
    private LocalDateTime estimatedReadyAt;

    private List<CustomerOrderItemResponse> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getCustomerUsername() {
        return customerUsername;
    }

    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getEstimatedReadyAt() {
        return estimatedReadyAt;
    }

    public void setEstimatedReadyAt(LocalDateTime estimatedReadyAt) {
        this.estimatedReadyAt = estimatedReadyAt;
    }

    public List<CustomerOrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CustomerOrderItemResponse> items) {
        this.items = items;
    }
}

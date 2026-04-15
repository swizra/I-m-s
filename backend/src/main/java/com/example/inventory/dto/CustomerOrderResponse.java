package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Customer order with items.")
public class CustomerOrderResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "KEFE-20260322-163045-482")
    private String orderNumber;

    @Schema(example = "PLACED")
    private String status;

    @Schema(example = "2026-03-22T16:30:45")
    private LocalDateTime createdAt;

    @Schema(example = "903.50")
    private BigDecimal totalAmount;

    @Schema(example = "Campus pickup desk, Building 5")
    private String deliveryAddress;

    @Schema(example = "Please prepare before 4 PM.")
    private String note;

    @Schema(example = "2026-03-22T18:30:45")
    private LocalDateTime estimatedReadyAt;

    @Schema(example = "2026-03-22T16:31:00")
    private LocalDateTime confirmationPreparedAt;

    @Schema(example = "lina@kefe.ch")
    private String confirmationRecipientEmail;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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

    public LocalDateTime getEstimatedReadyAt() {
        return estimatedReadyAt;
    }

    public void setEstimatedReadyAt(LocalDateTime estimatedReadyAt) {
        this.estimatedReadyAt = estimatedReadyAt;
    }

    public LocalDateTime getConfirmationPreparedAt() {
        return confirmationPreparedAt;
    }

    public void setConfirmationPreparedAt(LocalDateTime confirmationPreparedAt) {
        this.confirmationPreparedAt = confirmationPreparedAt;
    }

    public String getConfirmationRecipientEmail() {
        return confirmationRecipientEmail;
    }

    public void setConfirmationRecipientEmail(String confirmationRecipientEmail) {
        this.confirmationRecipientEmail = confirmationRecipientEmail;
    }

    public List<CustomerOrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CustomerOrderItemResponse> items) {
        this.items = items;
    }
}

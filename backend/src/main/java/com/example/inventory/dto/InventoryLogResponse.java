package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Inventory log entry returned by the API.")
public class InventoryLogResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "1")
    private Long productId;

    @Schema(example = "Student Laptop")
    private String productName;

    @Schema(example = "-2")
    private Integer changeAmount;

    @Schema(example = "STOCK_DECREASED")
    private String actionType;

    @Schema(example = "2026-03-22T10:15:30")
    private LocalDateTime timestamp;

    @Schema(example = "Opening week discount campaign reduced stock.")
    private String note;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Integer getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(Integer changeAmount) {
        this.changeAmount = changeAmount;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}

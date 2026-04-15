package com.example.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public class JobApplicationStatusUpdateRequest {

    @NotBlank
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

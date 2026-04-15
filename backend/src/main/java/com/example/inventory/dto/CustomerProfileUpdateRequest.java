package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for updating an authenticated customer profile.")
public class CustomerProfileUpdateRequest {

    @NotBlank(message = "Full name is required.")
    @Size(max = 120, message = "Full name must not exceed 120 characters.")
    @Schema(example = "Lina Meyer")
    private String fullName;

    @NotBlank(message = "Username is required.")
    @Size(max = 100, message = "Username must not exceed 100 characters.")
    @Schema(example = "lina")
    private String username;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    @Size(max = 160, message = "Email must not exceed 160 characters.")
    @Schema(example = "lina@kefe.ch")
    private String email;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

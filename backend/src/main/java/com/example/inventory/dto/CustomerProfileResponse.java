package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authenticated customer profile.")
public class CustomerProfileResponse {

    @Schema(example = "2")
    private Long id;

    @Schema(example = "Lina Meyer")
    private String fullName;

    @Schema(example = "lina")
    private String username;

    @Schema(example = "lina@kefe.ch")
    private String email;

    @Schema(example = "CUSTOMER")
    private String role;

    @Schema(example = "3")
    private Long wishlistCount;

    @Schema(example = "2")
    private Long reviewCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getWishlistCount() {
        return wishlistCount;
    }

    public void setWishlistCount(Long wishlistCount) {
        this.wishlistCount = wishlistCount;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }
}

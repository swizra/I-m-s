package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for creating or updating a category.")
public class CategoryRequest {

    @NotBlank(message = "Category name is required.")
    @Size(max = 100, message = "Category name must not exceed 100 characters.")
    @Schema(example = "Electronics")
    private String name;

    @NotBlank(message = "Category description is required.")
    @Size(max = 500, message = "Category description must not exceed 500 characters.")
    @Schema(example = "Devices and digital accessories.")
    private String description;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

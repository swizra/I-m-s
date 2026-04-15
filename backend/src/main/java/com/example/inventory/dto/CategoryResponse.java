package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Category data returned by the API.")
public class CategoryResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Electronics")
    private String name;

    @Schema(example = "Devices and digital accessories.")
    private String description;

    @Schema(example = "3")
    private long productCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }
}

package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Sales totals grouped by product category.")
public class DashboardCategorySalesResponse {

    @Schema(example = "Hair Care")
    private String categoryName;

    @Schema(example = "12")
    private Integer unitsSold;

    @Schema(example = "248.60")
    private BigDecimal revenue;

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getUnitsSold() {
        return unitsSold;
    }

    public void setUnitsSold(Integer unitsSold) {
        this.unitsSold = unitsSold;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}

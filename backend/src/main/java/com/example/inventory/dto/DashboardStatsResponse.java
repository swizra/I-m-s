package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Summary counters for the admin dashboard.")
public class DashboardStatsResponse {

    @Schema(example = "10")
    private long totalProducts;

    @Schema(example = "4")
    private long totalCategories;

    @Schema(example = "3")
    private long lowStockProducts;

    @Schema(example = "113")
    private long totalInventoryUnits;

    @Schema(example = "5")
    private long totalOrders;

    @Schema(example = "1240.40")
    private BigDecimal totalSales;

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalInventoryUnits() {
        return totalInventoryUnits;
    }

    public void setTotalInventoryUnits(long totalInventoryUnits) {
        this.totalInventoryUnits = totalInventoryUnits;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }
}

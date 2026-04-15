package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Extended admin dashboard insights.")
public class DashboardInsightsResponse {

    private LocalDateTime generatedAt;

    private List<DashboardAlertResponse> lowStockAlerts;

    private List<DashboardCategorySalesResponse> salesByCategory;

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<DashboardAlertResponse> getLowStockAlerts() {
        return lowStockAlerts;
    }

    public void setLowStockAlerts(List<DashboardAlertResponse> lowStockAlerts) {
        this.lowStockAlerts = lowStockAlerts;
    }

    public List<DashboardCategorySalesResponse> getSalesByCategory() {
        return salesByCategory;
    }

    public void setSalesByCategory(List<DashboardCategorySalesResponse> salesByCategory) {
        this.salesByCategory = salesByCategory;
    }
}

package com.example.inventory.controller;

import com.example.inventory.dto.DashboardInsightsResponse;
import com.example.inventory.dto.DashboardStatsResponse;
import com.example.inventory.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@Tag(name = "Admin Dashboard", description = "Protected dashboard summary endpoints.")
@SecurityRequirement(name = "bearerAuth")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard counters")
    public DashboardStatsResponse getDashboardStats() {
        return dashboardService.getStats();
    }

    @GetMapping("/insights")
    @Operation(summary = "Get extended dashboard insights")
    public DashboardInsightsResponse getDashboardInsights() {
        return dashboardService.getInsights();
    }

    @GetMapping(value = "/export.csv", produces = "text/csv")
    @Operation(summary = "Export dashboard insights as CSV")
    public ResponseEntity<String> exportDashboardInsights() {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"kefe-dashboard-export.csv\"")
                .body(dashboardService.exportInsightsCsv());
    }
}

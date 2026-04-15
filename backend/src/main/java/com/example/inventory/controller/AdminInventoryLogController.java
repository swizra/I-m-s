package com.example.inventory.controller;

import com.example.inventory.dto.InventoryLogResponse;
import com.example.inventory.service.InventoryLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/inventory-logs")
@Tag(name = "Admin Inventory Logs", description = "Protected endpoints for viewing stock activity.")
@SecurityRequirement(name = "bearerAuth")
public class AdminInventoryLogController {

    private final InventoryLogService inventoryLogService;

    public AdminInventoryLogController(InventoryLogService inventoryLogService) {
        this.inventoryLogService = inventoryLogService;
    }

    @GetMapping
    @Operation(summary = "Get inventory activity log")
    public List<InventoryLogResponse> getInventoryLogs() {
        return inventoryLogService.getAllLogs();
    }
}

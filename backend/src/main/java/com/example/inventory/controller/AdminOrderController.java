package com.example.inventory.controller;

import com.example.inventory.dto.AdminOrderResponse;
import com.example.inventory.dto.AdminOrderStatusUpdateRequest;
import com.example.inventory.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin/orders")
@Tag(name = "Admin Orders", description = "Protected endpoints for viewing customer orders.")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final CustomerOrderService customerOrderService;

    public AdminOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @GetMapping
    @Operation(summary = "Get all customer orders for admin management")
    public List<AdminOrderResponse> getAllOrders() {
        return customerOrderService.getAllOrdersForAdmin();
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent customer orders for the admin dashboard")
    public List<AdminOrderResponse> getRecentOrders() {
        return customerOrderService.getRecentOrdersForAdmin();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update an order status")
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(@PathVariable Long id,
                                                                @Valid @RequestBody AdminOrderStatusUpdateRequest request) {
        return ResponseEntity.ok(customerOrderService.updateOrderStatus(id, request));
    }
}

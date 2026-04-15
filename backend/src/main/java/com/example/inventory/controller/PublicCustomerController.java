package com.example.inventory.controller;

import com.example.inventory.dto.CustomerProfileResponse;
import com.example.inventory.dto.CustomerRegisterRequest;
import com.example.inventory.service.CustomerAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/customers")
@Tag(name = "Public Customer Auth", description = "Public endpoints for customer registration.")
public class PublicCustomerController {

    private final CustomerAccountService customerAccountService;

    public PublicCustomerController(CustomerAccountService customerAccountService) {
        this.customerAccountService = customerAccountService;
    }

    @PostMapping("/register")
    @Operation(
            summary = "Register a customer account",
            description = "Creates a customer account that can later exchange credentials for a JWT access token."
    )
    @ApiResponse(responseCode = "201", description = "Customer account created")
    public ResponseEntity<CustomerProfileResponse> registerCustomer(@Valid @RequestBody CustomerRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerAccountService.registerCustomer(request));
    }
}

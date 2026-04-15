package com.example.inventory.controller;

import com.example.inventory.dto.AuthTokenRequest;
import com.example.inventory.dto.AuthTokenResponse;
import com.example.inventory.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/auth")
@Tag(name = "Public Auth", description = "Public endpoint for exchanging username/password credentials for a JWT access token.")
public class PublicAuthController {

    private final AuthService authService;

    public PublicAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/token")
    @Operation(summary = "Issue an access token", description = "Authenticates the supplied username and password, then returns a bearer JWT for protected admin or customer API calls.")
    @ApiResponse(responseCode = "200", description = "Access token issued")
    public AuthTokenResponse createToken(@Valid @RequestBody AuthTokenRequest request) {
        return authService.authenticate(request.getUsername(), request.getPassword());
    }
}

package com.example.inventory.controller;

import com.example.inventory.dto.JobApplicationRequest;
import com.example.inventory.dto.JobApplicationResponse;
import com.example.inventory.service.AuthService;
import com.example.inventory.service.CareerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/careers")
@Tag(name = "Customer Careers", description = "Protected vacancy application endpoints for customers.")
@SecurityRequirement(name = "bearerAuth")
public class CustomerCareerController {

    private final AuthService authService;
    private final CareerService careerService;

    public CustomerCareerController(AuthService authService, CareerService careerService) {
        this.authService = authService;
        this.careerService = careerService;
    }

    @GetMapping("/applications")
    @Operation(summary = "Get the authenticated customer's applications")
    public List<JobApplicationResponse> getApplications(Authentication authentication) {
        return careerService.getApplicationsForCustomer(authService.extractUsername(authentication));
    }

    @PostMapping("/vacancies/{vacancyId}/apply")
    @Operation(summary = "Apply to a vacancy")
    public ResponseEntity<JobApplicationResponse> apply(Authentication authentication,
                                                        @PathVariable Long vacancyId,
                                                        @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(careerService.applyToVacancy(authService.extractUsername(authentication), vacancyId, request));
    }
}

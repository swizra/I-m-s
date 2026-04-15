package com.example.inventory.controller;

import com.example.inventory.dto.JobApplicationResponse;
import com.example.inventory.dto.JobApplicationStatusUpdateRequest;
import com.example.inventory.dto.VacancyRequest;
import com.example.inventory.dto.VacancyResponse;
import com.example.inventory.service.CareerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/careers")
@Tag(name = "Staff Careers", description = "Staff endpoints for managing vacancies and applications.")
@SecurityRequirement(name = "bearerAuth")
public class StaffCareerController {

    private final CareerService careerService;

    public StaffCareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping("/vacancies")
    @Operation(summary = "Get all vacancies for staff")
    public List<VacancyResponse> getVacancies() {
        return careerService.getAllVacanciesForStaff();
    }

    @PostMapping("/vacancies")
    @Operation(summary = "Create a vacancy")
    public ResponseEntity<VacancyResponse> createVacancy(@Valid @RequestBody VacancyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(careerService.createVacancy(request));
    }

    @PutMapping("/vacancies/{id}")
    @Operation(summary = "Update a vacancy")
    public VacancyResponse updateVacancy(@PathVariable Long id, @Valid @RequestBody VacancyRequest request) {
        return careerService.updateVacancy(id, request);
    }

    @GetMapping("/applications")
    @Operation(summary = "Get all applications")
    public List<JobApplicationResponse> getApplications() {
        return careerService.getAllApplicationsForStaff();
    }

    @GetMapping("/vacancies/{vacancyId}/applications")
    @Operation(summary = "Get applications for one vacancy")
    public List<JobApplicationResponse> getApplicationsForVacancy(@PathVariable Long vacancyId) {
        return careerService.getApplicationsForVacancy(vacancyId);
    }

    @PutMapping("/applications/{applicationId}/status")
    @Operation(summary = "Update the status of an application")
    public JobApplicationResponse updateApplicationStatus(@PathVariable Long applicationId,
                                                          @Valid @RequestBody JobApplicationStatusUpdateRequest request) {
        return careerService.updateApplicationStatus(applicationId, request);
    }
}

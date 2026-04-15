package com.example.inventory.controller;

import com.example.inventory.dto.VacancyResponse;
import com.example.inventory.service.CareerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/careers")
@Tag(name = "Public Careers", description = "Public vacancy listings for the KEFE careers page.")
public class PublicCareerController {

    private final CareerService careerService;

    public PublicCareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping("/vacancies")
    @Operation(summary = "Get all open vacancies")
    public List<VacancyResponse> getOpenVacancies() {
        return careerService.getOpenVacancies();
    }
}

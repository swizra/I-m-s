package com.example.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VacancyRequest {

    @NotBlank
    @Size(max = 140)
    private String title;

    @NotBlank
    @Size(max = 120)
    private String department;

    @NotBlank
    @Size(max = 120)
    private String location;

    @NotBlank
    @Size(max = 80)
    private String employmentType;

    @NotBlank
    @Size(max = 80)
    private String schedule;

    @Size(max = 120)
    private String salaryRange;

    @NotBlank
    @Size(max = 400)
    private String summary;

    @NotBlank
    @Size(max = 4000)
    private String description;

    @NotBlank
    @Size(max = 4000)
    private String responsibilities;

    @NotBlank
    @Size(max = 4000)
    private String requirements;

    @NotBlank
    @Size(max = 4000)
    private String benefits;

    private Boolean featured;

    @NotBlank
    private String status;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getResponsibilities() {
        return responsibilities;
    }

    public void setResponsibilities(String responsibilities) {
        this.responsibilities = responsibilities;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

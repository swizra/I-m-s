package com.example.inventory.service;

import com.example.inventory.dto.JobApplicationRequest;
import com.example.inventory.dto.JobApplicationResponse;
import com.example.inventory.dto.VacancyRequest;
import com.example.inventory.dto.VacancyResponse;
import com.example.inventory.dto.JobApplicationStatusUpdateRequest;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.AppUser;
import com.example.inventory.model.ApplicationStatus;
import com.example.inventory.model.JobApplication;
import com.example.inventory.model.Vacancy;
import com.example.inventory.model.VacancyStatus;
import com.example.inventory.repository.AppUserRepository;
import com.example.inventory.repository.JobApplicationRepository;
import com.example.inventory.repository.VacancyRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CareerService {

    private final VacancyRepository vacancyRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CustomerAccountService customerAccountService;
    private final AppUserRepository appUserRepository;

    public CareerService(VacancyRepository vacancyRepository,
                         JobApplicationRepository jobApplicationRepository,
                         CustomerAccountService customerAccountService,
                         AppUserRepository appUserRepository) {
        this.vacancyRepository = vacancyRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.customerAccountService = customerAccountService;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public List<VacancyResponse> getOpenVacancies() {
        return vacancyRepository.findByStatusOrderByFeaturedDescPublishedAtDescCreatedAtDesc(VacancyStatus.OPEN).stream()
                .map(this::mapVacancy)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VacancyResponse> getAllVacanciesForStaff() {
        return vacancyRepository.findAllByOrderByFeaturedDescCreatedAtDesc().stream()
                .map(this::mapVacancy)
                .toList();
    }

    @Transactional
    public VacancyResponse createVacancy(VacancyRequest request) {
        Vacancy vacancy = new Vacancy();
        applyVacancyRequest(vacancy, request);
        return mapVacancy(vacancyRepository.save(vacancy));
    }

    @Transactional
    public VacancyResponse updateVacancy(Long id, VacancyRequest request) {
        Vacancy vacancy = findVacancyEntity(id);
        applyVacancyRequest(vacancy, request);
        return mapVacancy(vacancyRepository.save(vacancy));
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsForCustomer(String username) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        return jobApplicationRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::mapApplication)
                .toList();
    }

    @Transactional
    public JobApplicationResponse applyToVacancy(String username, Long vacancyId, JobApplicationRequest request) {
        AppUser customer = customerAccountService.findCustomerByUsername(username);
        Vacancy vacancy = findVacancyEntity(vacancyId);

        if (vacancy.getStatus() != VacancyStatus.OPEN) {
            throw new BusinessValidationException("This vacancy is no longer accepting applications.");
        }

        if (jobApplicationRepository.existsByVacancyIdAndCustomerId(vacancyId, customer.getId())) {
            throw new BusinessValidationException("You already applied for this vacancy.");
        }

        JobApplication application = new JobApplication();
        application.setVacancy(vacancy);
        application.setCustomer(customer);
        application.setFullName(customer.getFullName());
        application.setEmail(customer.getEmail());
        application.setPhone(request.getPhone().trim());
        application.setCity(request.getCity().trim());
        application.setPortfolioUrl(normalizeNullable(request.getPortfolioUrl()));
        application.setCoverLetter(request.getCoverLetter().trim());
        application.setStatus(ApplicationStatus.SUBMITTED);
        return mapApplication(jobApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getAllApplicationsForStaff() {
        return jobApplicationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapApplication)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsForVacancy(Long vacancyId) {
        findVacancyEntity(vacancyId);
        return jobApplicationRepository.findByVacancyIdOrderByCreatedAtDesc(vacancyId).stream()
                .map(this::mapApplication)
                .toList();
    }

    @Transactional
    public JobApplicationResponse updateApplicationStatus(Long applicationId, JobApplicationStatusUpdateRequest request) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));
        application.setStatus(parseApplicationStatus(request.getStatus()));
        return mapApplication(jobApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public AppUser findStaffUser(String username) {
        return appUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found."));
    }

    @Transactional(readOnly = true)
    public Vacancy findVacancyEntity(Long id) {
        return vacancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found."));
    }

    private void applyVacancyRequest(Vacancy vacancy, VacancyRequest request) {
        vacancy.setTitle(request.getTitle().trim());
        vacancy.setDepartment(request.getDepartment().trim());
        vacancy.setLocation(request.getLocation().trim());
        vacancy.setEmploymentType(request.getEmploymentType().trim());
        vacancy.setSchedule(request.getSchedule().trim());
        vacancy.setSalaryRange(normalizeNullable(request.getSalaryRange()));
        vacancy.setSummary(request.getSummary().trim());
        vacancy.setDescription(request.getDescription().trim());
        vacancy.setResponsibilities(request.getResponsibilities().trim());
        vacancy.setRequirements(request.getRequirements().trim());
        vacancy.setBenefits(request.getBenefits().trim());
        vacancy.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        vacancy.setStatus(parseVacancyStatus(request.getStatus()));
    }

    private VacancyStatus parseVacancyStatus(String rawStatus) {
        try {
            return VacancyStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessValidationException("Unsupported vacancy status: " + rawStatus);
        }
    }

    private ApplicationStatus parseApplicationStatus(String rawStatus) {
        try {
            return ApplicationStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (Exception exception) {
            throw new BusinessValidationException("Unsupported application status: " + rawStatus);
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private VacancyResponse mapVacancy(Vacancy vacancy) {
        VacancyResponse response = new VacancyResponse();
        response.setId(vacancy.getId());
        response.setTitle(vacancy.getTitle());
        response.setDepartment(vacancy.getDepartment());
        response.setLocation(vacancy.getLocation());
        response.setEmploymentType(vacancy.getEmploymentType());
        response.setSchedule(vacancy.getSchedule());
        response.setSalaryRange(vacancy.getSalaryRange());
        response.setSummary(vacancy.getSummary());
        response.setDescription(vacancy.getDescription());
        response.setResponsibilities(vacancy.getResponsibilities());
        response.setRequirements(vacancy.getRequirements());
        response.setBenefits(vacancy.getBenefits());
        response.setStatus(vacancy.getStatus().name());
        response.setFeatured(vacancy.isFeatured());
        response.setApplicationCount(jobApplicationRepository.countByVacancyId(vacancy.getId()));
        response.setPublishedAt(vacancy.getPublishedAt());
        response.setCreatedAt(vacancy.getCreatedAt());
        response.setUpdatedAt(vacancy.getUpdatedAt());
        return response;
    }

    private JobApplicationResponse mapApplication(JobApplication application) {
        JobApplicationResponse response = new JobApplicationResponse();
        response.setId(application.getId());
        response.setVacancyId(application.getVacancy().getId());
        response.setVacancyTitle(application.getVacancy().getTitle());
        response.setDepartment(application.getVacancy().getDepartment());
        response.setLocation(application.getVacancy().getLocation());
        response.setEmploymentType(application.getVacancy().getEmploymentType());
        response.setSchedule(application.getVacancy().getSchedule());
        response.setCustomerId(application.getCustomer().getId());
        response.setCustomerUsername(application.getCustomer().getUsername());
        response.setFullName(application.getFullName());
        response.setEmail(application.getEmail());
        response.setPhone(application.getPhone());
        response.setCity(application.getCity());
        response.setPortfolioUrl(application.getPortfolioUrl());
        response.setCoverLetter(application.getCoverLetter());
        response.setStatus(application.getStatus().name());
        response.setCreatedAt(application.getCreatedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        return response;
    }
}

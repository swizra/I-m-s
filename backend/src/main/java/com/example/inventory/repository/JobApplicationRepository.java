package com.example.inventory.repository;

import com.example.inventory.model.JobApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByVacancyIdAndCustomerId(Long vacancyId, Long customerId);

    long countByVacancyId(Long vacancyId);

    List<JobApplication> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<JobApplication> findByVacancyIdOrderByCreatedAtDesc(Long vacancyId);

    List<JobApplication> findAllByOrderByCreatedAtDesc();
}

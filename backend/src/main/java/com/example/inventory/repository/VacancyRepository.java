package com.example.inventory.repository;

import com.example.inventory.model.Vacancy;
import com.example.inventory.model.VacancyStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacancyRepository extends JpaRepository<Vacancy, Long> {

    List<Vacancy> findByStatusOrderByFeaturedDescPublishedAtDescCreatedAtDesc(VacancyStatus status);

    List<Vacancy> findAllByOrderByFeaturedDescCreatedAtDesc();
}

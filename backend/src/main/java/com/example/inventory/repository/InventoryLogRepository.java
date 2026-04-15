package com.example.inventory.repository;

import com.example.inventory.model.InventoryLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    List<InventoryLog> findAllByOrderByTimestampDesc();
}

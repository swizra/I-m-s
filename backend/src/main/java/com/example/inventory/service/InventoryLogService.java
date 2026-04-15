package com.example.inventory.service;

import com.example.inventory.dto.InventoryLogResponse;
import com.example.inventory.model.InventoryLog;
import com.example.inventory.repository.InventoryLogRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryLogService {

    private final InventoryLogRepository inventoryLogRepository;

    public InventoryLogService(InventoryLogRepository inventoryLogRepository) {
        this.inventoryLogRepository = inventoryLogRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryLogResponse> getAllLogs() {
        return inventoryLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InventoryLogResponse mapToResponse(InventoryLog log) {
        InventoryLogResponse response = new InventoryLogResponse();
        response.setId(log.getId());
        response.setProductId(log.getProduct().getId());
        response.setProductName(log.getProduct().getName());
        response.setChangeAmount(log.getChangeAmount());
        response.setActionType(log.getActionType().name());
        response.setTimestamp(log.getTimestamp());
        response.setNote(log.getNote());
        return response;
    }
}

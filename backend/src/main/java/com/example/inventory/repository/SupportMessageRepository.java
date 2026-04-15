package com.example.inventory.repository;

import com.example.inventory.model.SupportMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}

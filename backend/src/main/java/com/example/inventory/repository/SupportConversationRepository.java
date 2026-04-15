package com.example.inventory.repository;

import com.example.inventory.model.SupportConversation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {

    List<SupportConversation> findByCustomerIdOrderByLastMessageAtDescCreatedAtDesc(Long customerId);

    List<SupportConversation> findAllByOrderByLastMessageAtDescCreatedAtDesc();
}

package com.example.inventory.repository;

import com.example.inventory.model.WishlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<WishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    long countByCustomerId(Long customerId);

    @Transactional
    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}

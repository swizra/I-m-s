package com.example.inventory.repository;

import com.example.inventory.model.CustomerOrder;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<CustomerOrder> findByOrderNumberAndCustomerId(String orderNumber, Long customerId);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    List<CustomerOrder> findTop10ByOrderByCreatedAtDesc();

    @Transactional
    void deleteByCustomerId(Long customerId);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o")
    BigDecimal sumAllOrderTotals();
}

package com.example.inventory.repository;

import com.example.inventory.model.ProductReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdOrderByUpdatedAtDesc(Long productId);

    List<ProductReview> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);

    Optional<ProductReview> findByProductIdAndCustomerId(Long productId, Long customerId);

    long countByProductId(Long productId);

    long countByCustomerId(Long customerId);

    @Query("select coalesce(avg(r.rating), 0) from ProductReview r where r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);
}

package com.example.inventory.repository;

import com.example.inventory.model.Product;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    List<Product> findByActiveTrueOrderByNameAsc();

    List<Product> findByActiveTrueOrderByCreatedAtDescIdDesc(Pageable pageable);

    List<Product> findTop4ByCategoryIdAndActiveTrueAndIdNotOrderByNameAsc(Long categoryId, Long id);

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    long countByStockQuantityBetween(Integer minStock, Integer maxStock);

    long countByCategoryId(Long categoryId);

    @Query("select coalesce(sum(p.stockQuantity), 0) from Product p")
    Long sumAllStockQuantity();
}

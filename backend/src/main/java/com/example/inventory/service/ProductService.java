package com.example.inventory.service;

import com.example.inventory.dto.ProductRequest;
import com.example.inventory.dto.ProductResponse;
import com.example.inventory.dto.StockUpdateRequest;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.Category;
import com.example.inventory.model.InventoryActionType;
import com.example.inventory.model.InventoryLog;
import com.example.inventory.model.Product;
import com.example.inventory.repository.InventoryLogRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.ProductReviewRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final InventoryLogRepository inventoryLogRepository;
    private final ProductReviewRepository productReviewRepository;
    private final CatalogLiveUpdateService catalogLiveUpdateService;

    public ProductService(ProductRepository productRepository,
                          CategoryService categoryService,
                          InventoryLogRepository inventoryLogRepository,
                          ProductReviewRepository productReviewRepository,
                          CatalogLiveUpdateService catalogLiveUpdateService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.inventoryLogRepository = inventoryLogRepository;
        this.productReviewRepository = productReviewRepository;
        this.catalogLiveUpdateService = catalogLiveUpdateService;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getPublicProducts() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 65));
        return productRepository.findByActiveTrueOrderByCreatedAtDescIdDesc(PageRequest.of(0, safeLimit)).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public ProductResponse getPublicProductById(Long id) {
        Product product = productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with id " + id));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedPublicProducts(Long id) {
        Product product = productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with id " + id));

        return productRepository.findTop4ByCategoryIdAndActiveTrueAndIdNotOrderByNameAsc(
                        product.getCategory().getId(),
                        product.getId()
                ).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return mapToResponse(findProductEntity(id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateBusinessRules(request, null);
        Category category = categoryService.findCategoryEntity(request.getCategoryId());

        Product product = new Product();
        applyRequestToProduct(product, request, category);
        Product savedProduct = productRepository.save(product);

        createInventoryLog(savedProduct, savedProduct.getStockQuantity(), InventoryActionType.CREATED,
                "Product created with initial stock.");
        catalogLiveUpdateService.publishCatalogRefresh("product-created");

        return mapToResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        validateBusinessRules(request, id);

        Product product = findProductEntity(id);
        Category category = categoryService.findCategoryEntity(request.getCategoryId());

        int oldStockQuantity = product.getStockQuantity();
        boolean detailsChanged = hasNonStockChanges(product, request, category);

        applyRequestToProduct(product, request, category);
        Product savedProduct = productRepository.save(product);

        if (detailsChanged) {
            createInventoryLog(savedProduct, 0, InventoryActionType.PRODUCT_UPDATED, "Product details updated.");
        }

        int stockDifference = savedProduct.getStockQuantity() - oldStockQuantity;
        if (stockDifference != 0) {
            createInventoryLog(savedProduct, stockDifference, resolveStockAction(stockDifference),
                    "Stock quantity changed while editing product details.");
        }

        catalogLiveUpdateService.publishCatalogRefresh("product-updated");
        return mapToResponse(savedProduct);
    }

    @Transactional
    @SuppressWarnings("null")
    public void deleteProduct(Long id) {
        findProductEntity(id);
        productRepository.deleteById(id);
        catalogLiveUpdateService.publishCatalogRefresh("product-deleted");
    }

    @Transactional
    public ProductResponse updateProductStock(Long id, StockUpdateRequest request) {
        Product product = findProductEntity(id);
        if (request.getNewStockQuantity() < 0) {
            throw new BusinessValidationException("Stock quantity cannot be negative.");
        }

        int oldStockQuantity = product.getStockQuantity();
        int newStockQuantity = request.getNewStockQuantity();
        int changeAmount = newStockQuantity - oldStockQuantity;

        product.setStockQuantity(newStockQuantity);
        Product savedProduct = productRepository.save(product);

        if (changeAmount != 0) {
            createInventoryLog(savedProduct, changeAmount, resolveStockAction(changeAmount),
                    normalizeNote(request.getNote(), "Manual stock update from admin page."));
        } else {
            createInventoryLog(savedProduct, 0, InventoryActionType.STOCK_UNCHANGED,
                    normalizeNote(request.getNote(), "Stock update submitted with no quantity change."));
        }

        catalogLiveUpdateService.publishCatalogRefresh("stock-updated");
        return mapToResponse(savedProduct);
    }

    @Transactional
    public void decreaseStockForOrder(Long productId, int quantity, String note) {
        if (quantity <= 0) {
            throw new BusinessValidationException("Order quantity must be greater than 0.");
        }

        Product product = findProductEntity(productId);
        if (product.getStockQuantity() < quantity) {
            throw new BusinessValidationException("Not enough stock for " + product.getName() + ".");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        Product savedProduct = productRepository.save(product);
        createInventoryLog(savedProduct, -quantity, InventoryActionType.STOCK_DECREASED, note);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public Product findProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }

    private void validateBusinessRules(ProductRequest request, Long currentProductId) {
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Product price must be greater than 0.");
        }
        if (request.getStockQuantity() == null || request.getStockQuantity() < 0) {
            throw new BusinessValidationException("Stock quantity cannot be negative.");
        }
        if (request.getRestockThreshold() == null || request.getRestockThreshold() < 0) {
            throw new BusinessValidationException("Restock threshold cannot be negative.");
        }

        String normalizedSku = normalizeSku(request.getSku());
        boolean skuExists = currentProductId == null
                ? productRepository.existsBySkuIgnoreCase(normalizedSku)
                : productRepository.existsBySkuIgnoreCaseAndIdNot(normalizedSku, currentProductId);
        if (skuExists) {
            throw new BusinessValidationException("SKU is already in use.");
        }
    }

    private void applyRequestToProduct(Product product, ProductRequest request, Category category) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl().trim());
        product.setSku(normalizeSku(request.getSku()));
        product.setBarcode(normalizeBarcode(request.getBarcode()));
        product.setRestockThreshold(request.getRestockThreshold());
        product.setActive(Boolean.TRUE.equals(request.getActive()));
        product.setCategory(category);
    }

    private boolean hasNonStockChanges(Product product, ProductRequest request, Category category) {
        if (!product.getName().equals(request.getName().trim())) {
            return true;
        }
        if (!product.getDescription().equals(request.getDescription().trim())) {
            return true;
        }
        if (product.getPrice().compareTo(request.getPrice()) != 0) {
            return true;
        }
        if (!product.getImageUrl().equals(request.getImageUrl().trim())) {
            return true;
        }
        if (!product.getSku().equals(normalizeSku(request.getSku()))) {
            return true;
        }
        if (!normalizeNullable(product.getBarcode()).equals(normalizeNullable(normalizeBarcode(request.getBarcode())))) {
            return true;
        }
        if (!product.getRestockThreshold().equals(request.getRestockThreshold())) {
            return true;
        }
        if (product.isActive() != Boolean.TRUE.equals(request.getActive())) {
            return true;
        }
        return !product.getCategory().getId().equals(category.getId());
    }

    private void createInventoryLog(Product product,
                                    int changeAmount,
                                    InventoryActionType actionType,
                                    String note) {
        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setChangeAmount(changeAmount);
        log.setActionType(actionType);
        log.setTimestamp(LocalDateTime.now());
        log.setNote(note);
        inventoryLogRepository.save(log);
    }

    private InventoryActionType resolveStockAction(int changeAmount) {
        return changeAmount > 0 ? InventoryActionType.STOCK_INCREASED : InventoryActionType.STOCK_DECREASED;
    }

    private String normalizeNote(String note, String fallback) {
        if (note == null || note.isBlank()) {
            return fallback;
        }
        return note.trim();
    }

    private String normalizeSku(String sku) {
        if (sku == null || sku.isBlank()) {
            throw new BusinessValidationException("SKU is required.");
        }
        return sku.trim().toUpperCase();
    }

    private String normalizeBarcode(String barcode) {
        if (barcode == null || barcode.isBlank()) {
            return null;
        }
        return barcode.trim();
    }

    private String normalizeNullable(String value) {
        return value == null ? "" : value;
    }

    private ProductResponse mapToResponse(Product product) {
        Integer restockThreshold = product.getRestockThreshold() == null ? 5 : product.getRestockThreshold();
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setImageUrl(product.getImageUrl());
        response.setSku(product.getSku());
        response.setBarcode(product.getBarcode());
        response.setRestockThreshold(restockThreshold);
        response.setActive(product.isActive());
        response.setAvailable(product.isActive() && product.getStockQuantity() > 0);
        response.setStockStatus(resolveStockStatus(product));
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setReviewCount(productReviewRepository.countByProductId(product.getId()));
        response.setAverageRating(roundRating(productReviewRepository.findAverageRatingByProductId(product.getId())));
        response.setCreatedAt(product.getCreatedAt());
        return response;
    }

    private String resolveStockStatus(Product product) {
        int stockQuantity = product.getStockQuantity();
        int restockThreshold = product.getRestockThreshold() == null ? 5 : product.getRestockThreshold();
        if (stockQuantity <= 0) {
            return "Out of Stock";
        }
        if (stockQuantity <= restockThreshold) {
            return "Low Stock";
        }
        return "In Stock";
    }

    private Double roundRating(Double rating) {
        if (rating == null) {
            return 0.0;
        }
        return Math.round(rating * 10.0) / 10.0;
    }
}

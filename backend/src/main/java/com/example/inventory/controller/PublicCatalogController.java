package com.example.inventory.controller;

import com.example.inventory.dto.CategoryResponse;
import com.example.inventory.dto.ProductResponse;
import com.example.inventory.dto.ProductReviewResponse;
import com.example.inventory.service.CatalogLiveUpdateService;
import com.example.inventory.service.CategoryService;
import com.example.inventory.service.ProductReviewService;
import com.example.inventory.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public Catalog", description = "Endpoints available to public shop users without authentication.")
public class PublicCatalogController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final ProductReviewService productReviewService;
    private final CatalogLiveUpdateService catalogLiveUpdateService;

    public PublicCatalogController(ProductService productService,
                                   CategoryService categoryService,
                                   ProductReviewService productReviewService,
                                   CatalogLiveUpdateService catalogLiveUpdateService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.productReviewService = productReviewService;
        this.catalogLiveUpdateService = catalogLiveUpdateService;
    }

    @GetMapping("/products")
    @Operation(summary = "Get all public products", description = "Returns all active products for the public shop page.")
    public List<ProductResponse> getPublicProducts() {
        return productService.getPublicProducts();
    }

    @GetMapping("/products/new-arrivals")
    @Operation(summary = "Get latest public products", description = "Returns the newest active products for the new arrivals page.")
    public List<ProductResponse> getNewArrivals(@RequestParam(defaultValue = "65") int limit) {
        return productService.getNewArrivals(limit);
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get a public product by ID")
    public ProductResponse getPublicProductById(@PathVariable Long id) {
        return productService.getPublicProductById(id);
    }

    @GetMapping("/products/{id}/related")
    @Operation(summary = "Get related public products")
    public List<ProductResponse> getRelatedPublicProducts(@PathVariable Long id) {
        return productService.getRelatedPublicProducts(id);
    }

    @GetMapping("/products/{id}/reviews")
    @Operation(summary = "Get customer reviews for a product")
    public List<ProductReviewResponse> getPublicProductReviews(@PathVariable Long id) {
        return productReviewService.getReviewsForProduct(id);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all public categories")
    public List<CategoryResponse> getPublicCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping(value = "/products/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to live catalog refresh events")
    public SseEmitter streamProductUpdates() {
        return catalogLiveUpdateService.subscribe();
    }
}

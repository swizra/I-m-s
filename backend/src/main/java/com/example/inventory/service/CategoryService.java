package com.example.inventory.service;

import com.example.inventory.dto.CategoryRequest;
import com.example.inventory.dto.CategoryResponse;
import com.example.inventory.exception.BusinessValidationException;
import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.Category;
import com.example.inventory.repository.CategoryRepository;
import com.example.inventory.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        validateUniqueName(request.getName(), null);

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryEntity(id);
        validateUniqueName(request.getName(), id);

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription().trim());

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    @SuppressWarnings("null")
    public void deleteCategory(Long id) {
        findCategoryEntity(id);
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BusinessValidationException("Category cannot be deleted because it still contains products.");
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public Category findCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }

    private void validateUniqueName(String name, Long currentCategoryId) {
        String normalizedName = name.trim();
        categoryRepository.findByNameIgnoreCase(normalizedName).ifPresent(existing -> {
            if (currentCategoryId == null || !existing.getId().equals(currentCategoryId)) {
                throw new BusinessValidationException("Category name already exists.");
            }
        });
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setProductCount(category.getProducts() == null ? 0 : category.getProducts().size());
        return response;
    }
}

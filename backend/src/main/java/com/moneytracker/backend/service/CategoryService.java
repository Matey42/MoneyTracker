package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.CategoryResponse;
import com.moneytracker.backend.dto.CreateCategoryRequest;
import com.moneytracker.backend.dto.UpdateCategoryRequest;
import com.moneytracker.backend.entity.Category;
import com.moneytracker.backend.entity.CategoryType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.exception.ResourceNotFoundException;
import com.moneytracker.backend.repository.CategoryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategoriesForUser(User user) {
        List<Category> categories = categoryRepository.findAllAccessibleByUser(user.getId());
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public List<CategoryResponse> getCategoriesByType(User user, CategoryType type) {
        List<Category> categories = categoryRepository.findAllAccessibleByUserAndType(user.getId(), type);
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public List<CategoryResponse> getSystemCategories() {
        List<Category> categories = categoryRepository.findByIsSystemTrue();
        return categories.stream()
                .map(CategoryResponse::from)
                .toList();
    }
    
    public CategoryResponse getCategoryById(UUID categoryId, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // User can access system categories or their own
        if (!category.getIsSystem() && (category.getUser() == null || !category.getUser().getId().equals(user.getId()))) {
            throw new AccessDeniedException("You don't have access to this category");
        }
        
        return CategoryResponse.from(category);
    }
    
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request, User user) {
        Category category = Category.builder()
                .name(request.name())
                .type(request.type())
                .icon(request.icon())
                .color(request.color())
                .isSystem(false)
                .user(user)
                .build();
        
        category = categoryRepository.save(category);
        return CategoryResponse.from(category);
    }
    
    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, UpdateCategoryRequest request, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Cannot update system categories
        if (category.getIsSystem()) {
            throw new AccessDeniedException("Cannot modify system categories");
        }
        
        // Must be owner
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only modify your own categories");
        }
        
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.type() != null) {
            category.setType(request.type());
        }
        if (request.icon() != null) {
            category.setIcon(request.icon());
        }
        if (request.color() != null) {
            category.setColor(request.color());
        }
        
        category = categoryRepository.save(category);
        return CategoryResponse.from(category);
    }
    
    @Transactional
    public void deleteCategory(UUID categoryId, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Cannot delete system categories
        if (category.getIsSystem()) {
            throw new AccessDeniedException("Cannot delete system categories");
        }
        
        // Must be owner
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own categories");
        }
        
        categoryRepository.delete(category);
    }
}

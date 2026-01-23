package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.CategoryResponse;
import com.moneytracker.backend.dto.CreateCategoryRequest;
import com.moneytracker.backend.dto.UpdateCategoryRequest;
import com.moneytracker.backend.entity.CategoryType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(@AuthenticationPrincipal User user) {
        List<CategoryResponse> categories = categoryService.getAllCategoriesForUser(user);
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable UUID categoryId,
                                                         @AuthenticationPrincipal User user) {
        CategoryResponse category = categoryService.getCategoryById(categoryId, user);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/income")
    public ResponseEntity<List<CategoryResponse>> getIncomeCategories(@AuthenticationPrincipal User user) {
        List<CategoryResponse> categories = categoryService.getCategoriesByType(user, CategoryType.INCOME);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/expense")
    public ResponseEntity<List<CategoryResponse>> getExpenseCategories(@AuthenticationPrincipal User user) {
        List<CategoryResponse> categories = categoryService.getCategoriesByType(user, CategoryType.EXPENSE);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/system")
    public ResponseEntity<List<CategoryResponse>> getSystemCategories() {
        List<CategoryResponse> categories = categoryService.getSystemCategories();
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request,
                                                            @AuthenticationPrincipal User user) {
        CategoryResponse category = categoryService.createCategory(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }
    
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable UUID categoryId,
                                                            @Valid @RequestBody UpdateCategoryRequest request,
                                                            @AuthenticationPrincipal User user) {
        CategoryResponse category = categoryService.updateCategory(categoryId, request, user);
        return ResponseEntity.ok(category);
    }
    
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId,
                                                @AuthenticationPrincipal User user) {
        categoryService.deleteCategory(categoryId, user);
        return ResponseEntity.noContent().build();
    }
}

package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.CategoryResponse;
import com.moneytracker.backend.entity.CategoryType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

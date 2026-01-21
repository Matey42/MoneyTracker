package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.CategoryResponse;
import com.moneytracker.backend.entity.Category;
import com.moneytracker.backend.entity.CategoryType;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}

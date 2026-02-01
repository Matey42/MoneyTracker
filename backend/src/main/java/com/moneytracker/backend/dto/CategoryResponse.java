package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.Category;
import com.moneytracker.backend.entity.CategoryType;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        CategoryType type,
        String icon,
        String color,
        boolean isSystem
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getIcon(),
                category.getColor(),
                category.getIsSystem() != null && category.getIsSystem()
        );
    }
}

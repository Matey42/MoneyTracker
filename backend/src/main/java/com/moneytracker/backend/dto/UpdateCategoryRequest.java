package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.CategoryType;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
        @Size(min = 1, max = 100)
        String name,
        
        CategoryType type,
        
        @Size(max = 50)
        String icon,
        
        @Size(max = 7)
        String color
) {}

package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank
        @Size(min = 1, max = 100)
        String name,
        
        @NotNull
        CategoryType type,
        
        @Size(max = 50)
        String icon,
        
        @Size(max = 7)
        String color
) {}

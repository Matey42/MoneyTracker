package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.WalletType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateWalletRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotNull(message = "Type is required")
        WalletType type,

        String currency,
        String description,
        String icon,
        String color
) {}

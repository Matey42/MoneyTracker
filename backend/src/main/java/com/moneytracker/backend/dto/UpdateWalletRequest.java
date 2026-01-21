package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.WalletType;
import jakarta.validation.constraints.Size;

public record UpdateWalletRequest(
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        WalletType type,
        String currency,
        String description,
        String icon,
        String color,
        Boolean isFavorite,
        Integer favoriteOrder
) {}

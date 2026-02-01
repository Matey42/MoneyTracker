package com.moneytracker.backend.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record BatchFavoriteUpdateRequest(
        @NotEmpty
        List<FavoriteItem> favorites
) {
    public record FavoriteItem(
            UUID walletId,
            boolean isFavorite,
            Integer favoriteOrder
    ) {}
}

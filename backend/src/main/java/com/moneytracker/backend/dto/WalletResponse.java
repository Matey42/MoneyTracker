package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.Wallet;
import com.moneytracker.backend.entity.WalletType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WalletResponse(
        UUID id,
        String name,
        WalletType type,
        String currency,
        BigDecimal balance,
        BigDecimal dailyChange,
        boolean isShared,
        int memberCount,
        boolean isOwner,
        String description,
        String icon,
        boolean isFavorite,
        Integer favoriteOrder,
        Instant createdAt
) {
    public static WalletResponse from(Wallet wallet, BigDecimal balance, BigDecimal dailyChange, boolean isOwner) {
        return new WalletResponse(
                wallet.getId(),
                wallet.getName(),
                wallet.getType(),
                wallet.getCurrency(),
                balance != null ? balance : BigDecimal.ZERO,
                dailyChange,
                wallet.isShared(),
                wallet.getMemberCount(),
                isOwner,
                wallet.getDescription(),
                wallet.getIcon(),
                wallet.getIsFavorite() != null && wallet.getIsFavorite(),
                wallet.getFavoriteOrder(),
                wallet.getCreatedAt()
        );
    }
}

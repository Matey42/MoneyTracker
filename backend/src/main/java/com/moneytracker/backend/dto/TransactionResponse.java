package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.Transaction;
import com.moneytracker.backend.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID walletId,
        TransactionType type,
        BigDecimal amount,
        String currency,
        UUID relatedWalletId,
        UUID userId,
        String displayName,
        UUID categoryId,
        String description,
        LocalDate transactionDate
) {
    public static TransactionResponse from(Transaction tx) {
        return new TransactionResponse(
                tx.getId(),
                tx.getWallet().getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getCurrency(),
                tx.getRelatedWallet() != null ? tx.getRelatedWallet().getId() : null,
                tx.getUser().getId(),
                tx.getUser().getFullName(),
                tx.getCategory() != null ? tx.getCategory().getId() : null,
                tx.getDescription(),
                tx.getTransactionDate()
        );
    }
}

package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTransactionRequest(
        @NotNull(message = "Wallet ID is required")
        UUID walletId,

        @NotNull(message = "Type is required")
        TransactionType type,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        BigDecimal amount,

        UUID categoryId,
        String description,
        UUID targetWalletId,
        LocalDate transactionDate
) {}

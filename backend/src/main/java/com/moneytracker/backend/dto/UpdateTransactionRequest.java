package com.moneytracker.backend.dto;

import com.moneytracker.backend.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateTransactionRequest(
        TransactionType type,
        
        @Positive
        BigDecimal amount,
        
        UUID categoryId,
        
        @Size(max = 500)
        String description,
        
        LocalDate transactionDate
) {}

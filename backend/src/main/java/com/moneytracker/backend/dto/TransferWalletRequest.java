package com.moneytracker.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TransferWalletRequest(
        @NotNull(message = "Target wallet ID is required")
        UUID targetWalletId
) {}

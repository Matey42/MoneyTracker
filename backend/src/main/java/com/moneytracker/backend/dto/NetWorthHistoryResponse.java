package com.moneytracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record NetWorthHistoryResponse(
        List<NetWorthPoint> history,
        BigDecimal currentNetWorth,
        BigDecimal periodChange,
        BigDecimal periodChangePercent
) {
    public record NetWorthPoint(
            LocalDate date,
            BigDecimal value,
            String label
    ) {}
}

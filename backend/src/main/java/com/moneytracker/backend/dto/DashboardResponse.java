package com.moneytracker.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalBalance,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpense,
        BigDecimal monthlyChange,
        List<WalletResponse> wallets,
        List<TransactionResponse> recentTransactions,
        List<CategoryBreakdown> categoryBreakdown
) {
    public record CategoryBreakdown(
            String categoryId,
            String categoryName,
            String categoryColor,
            BigDecimal amount,
            BigDecimal percentage
    ) {}
}

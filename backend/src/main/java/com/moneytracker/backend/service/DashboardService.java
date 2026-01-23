package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.DashboardResponse;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.dto.WalletResponse;
import com.moneytracker.backend.entity.*;
import com.moneytracker.backend.repository.CategoryRepository;
import com.moneytracker.backend.repository.TransactionRepository;
import com.moneytracker.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(WalletRepository walletRepository,
                           TransactionRepository transactionRepository,
                           CategoryRepository categoryRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardResponse getDashboard(User user) {
        UUID userId = user.getId();
        
        // Get all wallets with balances
        List<Wallet> wallets = walletRepository.findAllAccessibleByUser(userId);
        List<WalletResponse> walletResponses = wallets.stream()
                .map(wallet -> toWalletResponse(wallet, user))
                .toList();
        
        // Calculate total balance
        BigDecimal totalBalance = walletResponses.stream()
                .map(WalletResponse::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get current month's transactions
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();
        
        List<Transaction> monthTransactions = transactionRepository.findAllByUserInDateRange(
                userId, monthStart, monthEnd);
        
        // Calculate monthly income and expense
        BigDecimal monthlyIncome = monthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal monthlyExpense = monthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal monthlyChange = monthlyIncome.subtract(monthlyExpense);
        
        // Get recent transactions (top 10)
        List<TransactionResponse> recentTransactions = transactionRepository
                .findTop10ByWalletOwnerIdOrderByTransactionDateDescCreatedAtDesc(userId)
                .stream()
                .map(TransactionResponse::from)
                .toList();
        
        // Calculate category breakdown for expenses this month
        List<DashboardResponse.CategoryBreakdown> categoryBreakdown = 
                calculateCategoryBreakdown(monthTransactions, userId);
        
        return new DashboardResponse(
                totalBalance,
                monthlyIncome,
                monthlyExpense,
                monthlyChange,
                walletResponses,
                recentTransactions,
                categoryBreakdown
        );
    }
    
    private WalletResponse toWalletResponse(Wallet wallet, User user) {
        BigDecimal balance = transactionRepository.calculateBalance(wallet.getId());
        BigDecimal dailyChange = calculateDailyChange(wallet.getId());
        boolean isOwner = wallet.getOwner().getId().equals(user.getId());
        
        return WalletResponse.from(wallet, balance, dailyChange, isOwner);
    }
    
    private BigDecimal calculateDailyChange(UUID walletId) {
        LocalDate today = LocalDate.now();
        BigDecimal todayIncome = transactionRepository.sumByWalletAndTypeAndDateBetween(
                walletId, TransactionType.INCOME, today, today);
        BigDecimal todayExpense = transactionRepository.sumByWalletAndTypeAndDateBetween(
                walletId, TransactionType.EXPENSE, today, today);
        
        BigDecimal income = todayIncome != null ? todayIncome : BigDecimal.ZERO;
        BigDecimal expense = todayExpense != null ? todayExpense : BigDecimal.ZERO;
        
        return income.subtract(expense);
    }
    
    private List<DashboardResponse.CategoryBreakdown> calculateCategoryBreakdown(
            List<Transaction> transactions, UUID userId) {
        
        // Filter expense transactions only
        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            return Collections.emptyList();
        }
        
        // Group by category
        Map<UUID, BigDecimal> categoryAmounts = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        
        // Get category details
        Map<UUID, Category> categoryMap = categoryRepository.findAllById(categoryAmounts.keySet())
                .stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        
        // Build breakdown
        final BigDecimal total = totalExpense;
        return categoryAmounts.entrySet().stream()
                .map(entry -> {
                    Category category = categoryMap.get(entry.getKey());
                    if (category == null) return null;
                    
                    BigDecimal amount = entry.getValue();
                    BigDecimal percentage = amount.multiply(BigDecimal.valueOf(100))
                            .divide(total, 2, RoundingMode.HALF_UP);
                    
                    return new DashboardResponse.CategoryBreakdown(
                            category.getId().toString(),
                            category.getName(),
                            category.getColor() != null ? category.getColor() : "#808080",
                            amount,
                            percentage
                    );
                })
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.amount().compareTo(a.amount()))
                .toList();
    }
}

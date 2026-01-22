package com.moneytracker.backend.config;

import com.moneytracker.backend.entity.*;
import com.moneytracker.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@Profile("dev")
public class DevDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    @Bean
    CommandLineRunner initDemoData(
            UserRepository userRepository,
            WalletRepository walletRepository,
            WalletMemberRepository walletMemberRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Check if demo user already exists
            if (userRepository.findByEmail("demo@example.com").isPresent()) {
                log.info("Demo data already exists, skipping initialization");
                return;
            }

            log.info("Initializing demo data for dev environment...");

            // Create demo user
            User demoUser = new User();
            demoUser.setEmail("demo@example.com");
            demoUser.setPassword(passwordEncoder.encode("password"));
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser = userRepository.save(demoUser);
            log.info("Created demo user: demo@example.com / password");

            // Get system categories
            List<Category> expenseCategories = categoryRepository.findAllAccessibleByUserAndType(demoUser.getId(), CategoryType.EXPENSE);
            List<Category> incomeCategories = categoryRepository.findAllAccessibleByUserAndType(demoUser.getId(), CategoryType.INCOME);

            Category shopping = findCategoryByName(expenseCategories, "Shopping");
            Category entertainment = findCategoryByName(expenseCategories, "Entertainment");
            Category bills = findCategoryByName(expenseCategories, "Bills & Utilities");
            Category transport = findCategoryByName(expenseCategories, "Transportation");
            Category dining = findCategoryByName(expenseCategories, "Food & Dining");
            Category salary = findCategoryByName(incomeCategories, "Salary");
            Category otherIncome = findCategoryByName(incomeCategories, "Other Income");
            Category freelance = findCategoryByName(incomeCategories, "Freelance");

            // Create wallets
            Wallet personalAccount = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Personal Account", WalletType.BANK_CASH, "PLN", "My main checking account", "bank", null, true, 0);

            Wallet familyBudget = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Family Budget", WalletType.BANK_CASH, "PLN", "Shared family expenses", "wallet", null, true, 1);

            Wallet emergencySavings = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Emergency Savings", WalletType.BANK_CASH, "PLN", null, "safe", null, false, null);

            Wallet vacationFund = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Vacation Fund", WalletType.BANK_CASH, "PLN", null, "piggy", null, false, null);

            Wallet businessAccount = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Business Account", WalletType.BANK_CASH, "PLN", null, "briefcase", null, false, null);

            Wallet stockPortfolio = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Stock Portfolio", WalletType.INVESTMENTS, "PLN", null, "chart", null, true, 2);

            Wallet retirementFund = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Retirement Fund", WalletType.INVESTMENTS, "PLN", null, "coins", null, false, null);

            Wallet bitcoinWallet = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Bitcoin Wallet", WalletType.CRYPTO, "PLN", null, "bitcoin", null, true, 3);

            Wallet ethereumWallet = createWallet(walletRepository, walletMemberRepository, demoUser,
                    "Ethereum Wallet", WalletType.CRYPTO, "PLN", null, "coins", null, false, null);

            log.info("Created {} wallets", 9);

            // Create transactions to build up balances
            LocalDate today = LocalDate.now();

            // Personal Account transactions (target balance ~8500)
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.INCOME,
                    new BigDecimal("5000.00"), salary, "Monthly salary", today.minusDays(20));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.INCOME,
                    new BigDecimal("5000.00"), salary, "Monthly salary", today.minusDays(50));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("125.50"), shopping, "Weekly groceries at Biedronka", today.minusDays(2));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("450.00"), bills, "Electric bill December", today.minusDays(7));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("65.00"), transport, "Uber rides", today.minusDays(11));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("180.00"), dining, "Restaurant dinner", today.minusDays(12));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.INCOME,
                    new BigDecimal("250.00"), freelance, "Freelance project", today.minusDays(13));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("430.00"), shopping, "Monthly groceries", today.minusDays(25));
            createTransaction(transactionRepository, personalAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("500.00"), bills, "Rent contribution", today.minusDays(30));

            // Family Budget transactions (target balance ~4200)
            createTransaction(transactionRepository, familyBudget, demoUser, TransactionType.INCOME,
                    new BigDecimal("5000.00"), otherIncome, "Family contribution", today.minusDays(25));
            createTransaction(transactionRepository, familyBudget, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("89.99"), entertainment, "Netflix subscription", today.minusDays(6));
            createTransaction(transactionRepository, familyBudget, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("350.00"), shopping, "Family groceries", today.minusDays(10));
            createTransaction(transactionRepository, familyBudget, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("360.01"), bills, "Internet & Phone", today.minusDays(15));

            // Emergency Savings (target balance ~15000)
            createTransaction(transactionRepository, emergencySavings, demoUser, TransactionType.INCOME,
                    new BigDecimal("15000.00"), otherIncome, "Initial savings deposit", today.minusDays(60));

            // Vacation Fund (target balance ~2720)
            createTransaction(transactionRepository, vacationFund, demoUser, TransactionType.INCOME,
                    new BigDecimal("2720.00"), otherIncome, "Vacation savings", today.minusDays(45));

            // Business Account (target balance ~12500)
            createTransaction(transactionRepository, businessAccount, demoUser, TransactionType.INCOME,
                    new BigDecimal("15000.00"), freelance, "Client payment", today.minusDays(30));
            createTransaction(transactionRepository, businessAccount, demoUser, TransactionType.EXPENSE,
                    new BigDecimal("2500.00"), bills, "Business expenses", today.minusDays(20));

            // Stock Portfolio (target balance ~45000)
            createTransaction(transactionRepository, stockPortfolio, demoUser, TransactionType.INCOME,
                    new BigDecimal("45000.00"), otherIncome, "Stock portfolio value", today.minusDays(90));

            // Retirement Fund (target balance ~82000)
            createTransaction(transactionRepository, retirementFund, demoUser, TransactionType.INCOME,
                    new BigDecimal("82000.00"), otherIncome, "Retirement savings", today.minusDays(120));

            // Bitcoin Wallet (target balance ~12500)
            createTransaction(transactionRepository, bitcoinWallet, demoUser, TransactionType.INCOME,
                    new BigDecimal("12500.00"), otherIncome, "Bitcoin holdings", today.minusDays(100));

            // Ethereum Wallet (target balance ~5600)
            createTransaction(transactionRepository, ethereumWallet, demoUser, TransactionType.INCOME,
                    new BigDecimal("5600.00"), otherIncome, "Ethereum holdings", today.minusDays(95));

            log.info("Demo data initialization complete!");
            log.info("Login credentials: demo@example.com / password");
        };
    }

    private Category findCategoryByName(List<Category> categories, String name) {
        return categories.stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(categories.isEmpty() ? null : categories.get(0));
    }

    private Wallet createWallet(WalletRepository walletRepository,
                                WalletMemberRepository walletMemberRepository,
                                User owner, String name, WalletType type, String currency,
                                String description, String icon, String color,
                                boolean isFavorite, Integer favoriteOrder) {
        Wallet wallet = new Wallet();
        wallet.setOwner(owner);
        wallet.setName(name);
        wallet.setType(type);
        wallet.setCurrency(currency);
        wallet.setDescription(description);
        wallet.setIcon(icon);
        wallet.setColor(color);
        wallet.setIsFavorite(isFavorite);
        wallet.setFavoriteOrder(favoriteOrder);
        wallet = walletRepository.save(wallet);

        // Add owner as member
        WalletMember member = new WalletMember();
        member.setWallet(wallet);
        member.setUser(owner);
        member.setRole(MemberRole.OWNER);
        walletMemberRepository.save(member);

        return wallet;
    }

    private void createTransaction(TransactionRepository transactionRepository,
                                   Wallet wallet, User user, TransactionType type,
                                   BigDecimal amount, Category category,
                                   String description, LocalDate date) {
        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setUser(user);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setCurrency(wallet.getCurrency());
        tx.setCategory(category);
        tx.setDescription(description);
        tx.setTransactionDate(date);
        transactionRepository.save(tx);
    }
}

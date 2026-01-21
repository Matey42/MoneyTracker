package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.CreateTransactionRequest;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.entity.*;
import com.moneytracker.backend.exception.ResourceNotFoundException;
import com.moneytracker.backend.repository.CategoryRepository;
import com.moneytracker.backend.repository.TransactionRepository;
import com.moneytracker.backend.repository.WalletMemberRepository;
import com.moneytracker.backend.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final WalletMemberRepository walletMemberRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              WalletRepository walletRepository,
                              WalletMemberRepository walletMemberRepository,
                              CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.walletMemberRepository = walletMemberRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<TransactionResponse> getTransactionsByWallet(UUID walletId, User user, Pageable pageable) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!hasAccess(wallet, user)) {
            throw new AccessDeniedException("You don't have access to this wallet");
        }

        return transactionRepository.findByWalletIdOrderByTransactionDateDesc(walletId, pageable)
                .map(TransactionResponse::from);
    }

    public Page<TransactionResponse> getAllTransactionsForUser(User user, Pageable pageable) {
        return transactionRepository.findAllAccessibleByUser(user.getId(), pageable)
                .map(TransactionResponse::from);
    }

    public Page<TransactionResponse> getTransactionsByDateRange(UUID walletId, User user,
                                                                 LocalDate startDate, LocalDate endDate,
                                                                 Pageable pageable) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!hasAccess(wallet, user)) {
            throw new AccessDeniedException("You don't have access to this wallet");
        }

        return transactionRepository.findByWalletIdAndTransactionDateBetween(
                walletId, startDate, endDate, pageable)
                .map(TransactionResponse::from);
    }

    public TransactionResponse createTransaction(CreateTransactionRequest request, User user) {
        Wallet wallet = walletRepository.findById(request.walletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!hasWriteAccess(wallet, user)) {
            throw new AccessDeniedException("You don't have permission to add transactions to this wallet");
        }

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setUser(user);
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCurrency(wallet.getCurrency());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate() != null ? request.transactionDate() : LocalDate.now());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            transaction.setCategory(category);
        }

        // Handle transfer transactions
        if (request.type() == TransactionType.TRANSFER && request.targetWalletId() != null) {
            Wallet targetWallet = walletRepository.findById(request.targetWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target wallet not found"));

            if (!hasWriteAccess(targetWallet, user)) {
                throw new AccessDeniedException("You don't have permission to add transactions to the target wallet");
            }

            transaction.setRelatedWallet(targetWallet);

            // Create the corresponding transaction in target wallet
            Transaction incomingTransaction = new Transaction();
            incomingTransaction.setWallet(targetWallet);
            incomingTransaction.setUser(user);
            incomingTransaction.setType(TransactionType.TRANSFER);
            incomingTransaction.setAmount(request.amount());
            incomingTransaction.setCurrency(targetWallet.getCurrency());
            incomingTransaction.setDescription("Transfer from " + wallet.getName());
            incomingTransaction.setTransactionDate(transaction.getTransactionDate());
            incomingTransaction.setRelatedWallet(wallet);

            transactionRepository.save(incomingTransaction);
        }

        transaction = transactionRepository.save(transaction);
        return TransactionResponse.from(transaction);
    }

    public void deleteTransaction(UUID transactionId, User user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!hasWriteAccess(transaction.getWallet(), user)) {
            throw new AccessDeniedException("You don't have permission to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    public BigDecimal getWalletBalance(UUID walletId, User user) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!hasAccess(wallet, user)) {
            throw new AccessDeniedException("You don't have access to this wallet");
        }

        BigDecimal balance = transactionRepository.calculateBalance(walletId);
        return balance != null ? balance : BigDecimal.ZERO;
    }

    private boolean hasAccess(Wallet wallet, User user) {
        return wallet.getOwner().getId().equals(user.getId()) ||
               walletMemberRepository.existsByWalletIdAndUserId(wallet.getId(), user.getId());
    }

    private boolean hasWriteAccess(Wallet wallet, User user) {
        if (wallet.getOwner().getId().equals(user.getId())) {
            return true;
        }

        return walletMemberRepository.findByWalletIdAndUserId(wallet.getId(), user.getId())
                .map(member -> member.getRole() == MemberRole.OWNER || member.getRole() == MemberRole.MEMBER)
                .orElse(false);
    }
}

package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.CreateTransactionRequest;
import com.moneytracker.backend.dto.TransactionResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TransactionResponse> transactions = transactionService.getAllTransactionsForUser(user, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<Page<TransactionResponse>> getWalletTransactions(
            @PathVariable UUID walletId,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TransactionResponse> transactions = transactionService.getTransactionsByWallet(walletId, user, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/wallet/{walletId}/range")
    public ResponseEntity<Page<TransactionResponse>> getWalletTransactionsByDateRange(
            @PathVariable UUID walletId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TransactionResponse> transactions = transactionService.getTransactionsByDateRange(
                walletId, user, startDate, endDate, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/wallet/{walletId}/balance")
    public ResponseEntity<BigDecimal> getWalletBalance(@PathVariable UUID walletId,
                                                        @AuthenticationPrincipal User user) {
        BigDecimal balance = transactionService.getWalletBalance(walletId, user);
        return ResponseEntity.ok(balance);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal User user) {
        TransactionResponse transaction = transactionService.createTransaction(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID transactionId,
                                                   @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(transactionId, user);
        return ResponseEntity.noContent().build();
    }
}

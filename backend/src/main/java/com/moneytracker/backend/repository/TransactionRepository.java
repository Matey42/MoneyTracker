package com.moneytracker.backend.repository;

import com.moneytracker.backend.entity.Transaction;
import com.moneytracker.backend.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    Page<Transaction> findByWalletIdOrderByTransactionDateDesc(UUID walletId, Pageable pageable);
    
    List<Transaction> findByWalletIdAndTransactionDateBetween(UUID walletId, LocalDate start, LocalDate end);
    
    Page<Transaction> findByWalletIdAndTransactionDateBetween(UUID walletId, LocalDate start, LocalDate end, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) - " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
           "FROM Transaction t WHERE t.wallet.id = :walletId")
    BigDecimal calculateBalance(UUID walletId);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.wallet.id = :walletId AND t.type = :type AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByWalletAndTypeAndDateBetween(UUID walletId, TransactionType type, LocalDate start, LocalDate end);
    
    @Query("SELECT t FROM Transaction t WHERE t.wallet.owner.id = :userId OR " +
           "EXISTS (SELECT m FROM WalletMember m WHERE m.wallet = t.wallet AND m.user.id = :userId) " +
           "ORDER BY t.transactionDate DESC, t.createdAt DESC")
    Page<Transaction> findAllAccessibleByUser(UUID userId, Pageable pageable);
    
    List<Transaction> findTop10ByWalletOwnerIdOrderByTransactionDateDescCreatedAtDesc(UUID userId);
}

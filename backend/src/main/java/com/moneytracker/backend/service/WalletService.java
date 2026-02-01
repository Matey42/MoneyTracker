package com.moneytracker.backend.service;

import com.moneytracker.backend.dto.BatchFavoriteUpdateRequest;
import com.moneytracker.backend.dto.CreateWalletRequest;
import com.moneytracker.backend.dto.UpdateWalletRequest;
import com.moneytracker.backend.dto.WalletResponse;
import com.moneytracker.backend.entity.*;
import com.moneytracker.backend.exception.ResourceNotFoundException;
import com.moneytracker.backend.repository.TransactionRepository;
import com.moneytracker.backend.repository.WalletMemberRepository;
import com.moneytracker.backend.repository.WalletRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletMemberRepository walletMemberRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository,
                         WalletMemberRepository walletMemberRepository,
                         TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.walletMemberRepository = walletMemberRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<WalletResponse> getAllWalletsForUser(User user) {
        List<Wallet> wallets = walletRepository.findAllAccessibleByUser(user.getId());
        return wallets.stream()
                .map(wallet -> toResponse(wallet, user))
                .toList();
    }

    public List<WalletResponse> getFavoriteWallets(User user) {
        List<Wallet> wallets = walletRepository.findFavoritesByUserId(user.getId());
        return wallets.stream()
                .map(wallet -> toResponse(wallet, user))
                .toList();
    }

    public WalletResponse getWalletById(UUID walletId, User user) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!hasAccess(wallet, user)) {
            throw new AccessDeniedException("You don't have access to this wallet");
        }

        return toResponse(wallet, user);
    }

    public WalletResponse createWallet(CreateWalletRequest request, User user) {
        Wallet wallet = new Wallet();
        wallet.setOwner(user);
        wallet.setName(request.name());
        wallet.setType(request.type());
        wallet.setCurrency(request.currency() != null ? request.currency() : "USD");
        wallet.setDescription(request.description());
        wallet.setIcon(request.icon());
        wallet.setIsFavorite(false);

        wallet = walletRepository.save(wallet);

        // Add owner as a member with OWNER role
        WalletMember ownerMember = new WalletMember();
        ownerMember.setWallet(wallet);
        ownerMember.setUser(user);
        ownerMember.setRole(MemberRole.OWNER);
        walletMemberRepository.save(ownerMember);

        return toResponse(wallet, user);
    }

    public WalletResponse updateWallet(UUID walletId, UpdateWalletRequest request, User user) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!isOwner(wallet, user)) {
            throw new AccessDeniedException("Only the owner can update this wallet");
        }

        if (request.name() != null) {
            wallet.setName(request.name());
        }
        if (request.type() != null) {
            wallet.setType(request.type());
        }
        if (request.currency() != null) {
            wallet.setCurrency(request.currency());
        }
        if (request.description() != null) {
            wallet.setDescription(request.description());
        }
        if (request.icon() != null) {
            wallet.setIcon(request.icon());
        }
        if (request.isFavorite() != null) {
            wallet.setIsFavorite(request.isFavorite());
        }
        if (request.favoriteOrder() != null) {
            wallet.setFavoriteOrder(request.favoriteOrder());
        }

        wallet = walletRepository.save(wallet);
        return toResponse(wallet, user);
    }

    public void deleteWallet(UUID walletId, User user) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (!isOwner(wallet, user)) {
            throw new AccessDeniedException("Only the owner can delete this wallet");
        }

        walletRepository.delete(wallet);
    }

    public WalletResponse transferWallet(UUID sourceWalletId, UUID targetWalletId, User user) {
        Wallet sourceWallet = walletRepository.findById(sourceWalletId)
                .orElseThrow(() -> new ResourceNotFoundException("Source wallet not found"));

        Wallet targetWallet = walletRepository.findById(targetWalletId)
                .orElseThrow(() -> new ResourceNotFoundException("Target wallet not found"));

        if (!isOwner(sourceWallet, user)) {
            throw new AccessDeniedException("Only the owner can transfer this wallet");
        }

        if (!isOwner(targetWallet, user)) {
            throw new AccessDeniedException("You don't have access to the target wallet");
        }

        if (sourceWalletId.equals(targetWalletId)) {
            throw new IllegalArgumentException("Cannot transfer wallet to itself");
        }

        // Move all transactions from source to target wallet
        List<Transaction> transactions = transactionRepository.findByWalletId(sourceWalletId);
        for (Transaction transaction : transactions) {
            transaction.setWallet(targetWallet);
        }
        transactionRepository.saveAll(transactions);

        // Update any transactions that reference this wallet as a related/target wallet
        List<Transaction> relatedTransactions = transactionRepository.findByRelatedWalletId(sourceWalletId);
        for (Transaction transaction : relatedTransactions) {
            transaction.setRelatedWallet(targetWallet);
        }
        transactionRepository.saveAll(relatedTransactions);

        // Delete the source wallet (cascades to wallet members)
        walletRepository.delete(sourceWallet);

        return toResponse(targetWallet, user);
    }
    
    public List<WalletResponse> updateFavorites(BatchFavoriteUpdateRequest request, User user) {
        for (BatchFavoriteUpdateRequest.FavoriteItem item : request.favorites()) {
            Wallet wallet = walletRepository.findById(item.walletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet not found: " + item.walletId()));
            
            if (!isOwner(wallet, user)) {
                throw new AccessDeniedException("Only the owner can update favorite status");
            }
            
            wallet.setIsFavorite(item.isFavorite());
            wallet.setFavoriteOrder(item.favoriteOrder());
            walletRepository.save(wallet);
        }
        
        return getFavoriteWallets(user);
    }

    private WalletResponse toResponse(Wallet wallet, User user) {
        BigDecimal balance = transactionRepository.calculateBalance(wallet.getId());
        BigDecimal dailyChange = calculateDailyChange(wallet.getId());
        boolean isOwner = isOwner(wallet, user);

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

    private boolean hasAccess(Wallet wallet, User user) {
        return wallet.getOwner().getId().equals(user.getId()) ||
               walletMemberRepository.existsByWalletIdAndUserId(wallet.getId(), user.getId());
    }

    private boolean isOwner(Wallet wallet, User user) {
        return wallet.getOwner().getId().equals(user.getId());
    }
}

package com.moneytracker.backend.controller;

import com.moneytracker.backend.dto.BatchFavoriteUpdateRequest;
import com.moneytracker.backend.dto.CreateWalletRequest;
import com.moneytracker.backend.dto.TransferWalletRequest;
import com.moneytracker.backend.dto.UpdateWalletRequest;
import com.moneytracker.backend.dto.WalletResponse;
import com.moneytracker.backend.entity.User;
import com.moneytracker.backend.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<List<WalletResponse>> getAllWallets(@AuthenticationPrincipal User user) {
        List<WalletResponse> wallets = walletService.getAllWalletsForUser(user);
        return ResponseEntity.ok(wallets);
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<WalletResponse>> getFavoriteWallets(@AuthenticationPrincipal User user) {
        List<WalletResponse> wallets = walletService.getFavoriteWallets(user);
        return ResponseEntity.ok(wallets);
    }
    
    @PutMapping("/favorites")
    public ResponseEntity<List<WalletResponse>> updateFavorites(@Valid @RequestBody BatchFavoriteUpdateRequest request,
                                                                 @AuthenticationPrincipal User user) {
        List<WalletResponse> wallets = walletService.updateFavorites(request, user);
        return ResponseEntity.ok(wallets);
    }

    @GetMapping("/{walletId}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable UUID walletId,
                                                     @AuthenticationPrincipal User user) {
        WalletResponse wallet = walletService.getWalletById(walletId, user);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping
    public ResponseEntity<WalletResponse> createWallet(@Valid @RequestBody CreateWalletRequest request,
                                                        @AuthenticationPrincipal User user) {
        WalletResponse wallet = walletService.createWallet(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(wallet);
    }

    @PutMapping("/{walletId}")
    public ResponseEntity<WalletResponse> updateWallet(@PathVariable UUID walletId,
                                                        @Valid @RequestBody UpdateWalletRequest request,
                                                        @AuthenticationPrincipal User user) {
        WalletResponse wallet = walletService.updateWallet(walletId, request, user);
        return ResponseEntity.ok(wallet);
    }

    @DeleteMapping("/{walletId}")
    public ResponseEntity<Void> deleteWallet(@PathVariable UUID walletId,
                                              @AuthenticationPrincipal User user) {
        walletService.deleteWallet(walletId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{walletId}/transfer")
    public ResponseEntity<WalletResponse> transferWallet(@PathVariable UUID walletId,
                                                          @Valid @RequestBody TransferWalletRequest request,
                                                          @AuthenticationPrincipal User user) {
        WalletResponse targetWallet = walletService.transferWallet(walletId, request.targetWalletId(), user);
        return ResponseEntity.ok(targetWallet);
    }
}

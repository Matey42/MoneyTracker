package com.moneytracker.backend.repository;

import com.moneytracker.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    
    List<Wallet> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    
    @Query("SELECT w FROM Wallet w WHERE w.owner.id = :userId OR EXISTS " +
           "(SELECT m FROM WalletMember m WHERE m.wallet = w AND m.user.id = :userId)")
    List<Wallet> findAllAccessibleByUser(UUID userId);
    
    @Query("SELECT w FROM Wallet w WHERE w.owner.id = :userId AND w.isFavorite = true " +
           "ORDER BY w.favoriteOrder ASC NULLS LAST")
    List<Wallet> findFavoritesByUserId(UUID userId);
    
    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);
}

package com.moneytracker.backend.repository;

import com.moneytracker.backend.entity.WalletMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletMemberRepository extends JpaRepository<WalletMember, UUID> {
    
    List<WalletMember> findByWalletId(UUID walletId);
    
    Optional<WalletMember> findByWalletIdAndUserId(UUID walletId, UUID userId);
    
    boolean existsByWalletIdAndUserId(UUID walletId, UUID userId);
    
    void deleteByWalletIdAndUserId(UUID walletId, UUID userId);
}

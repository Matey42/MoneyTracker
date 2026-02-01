package com.moneytracker.backend.repository;

import com.moneytracker.backend.entity.Category;
import com.moneytracker.backend.entity.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    @Query("SELECT c FROM Category c WHERE c.isSystem = true OR c.user.id = :userId ORDER BY c.name")
    List<Category> findAllAccessibleByUser(UUID userId);
    
    @Query("SELECT c FROM Category c WHERE (c.isSystem = true OR c.user.id = :userId) AND c.type = :type ORDER BY c.name")
    List<Category> findAllAccessibleByUserAndType(UUID userId, CategoryType type);
    
    List<Category> findByIsSystemTrue();
    
    List<Category> findByUserId(UUID userId);
}

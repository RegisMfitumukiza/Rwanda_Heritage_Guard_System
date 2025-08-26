package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    
    // Find by language code
    Optional<Language> findByCode(String code);
    
    // Find all active languages
    List<Language> findByIsActiveTrue();
    
    // Find default language
    Optional<Language> findByIsDefaultTrue();
    
    // Find by code and active status
    Optional<Language> findByCodeAndIsActiveTrue(String code);
    
    // Check if language code exists
    boolean existsByCode(String code);
    
    // Find languages by multiple codes
    List<Language> findByCodeIn(List<String> codes);
    
    // Custom query to find languages ordered by default first, then by name
    @Query("SELECT l FROM Language l WHERE l.isActive = true ORDER BY l.isDefault DESC, l.name ASC")
    List<Language> findActiveLanguagesOrdered();
    
    // Count active languages
    long countByIsActiveTrue();
} 
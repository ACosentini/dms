package io.github.acosentini.dms.repository;

import io.github.acosentini.dms.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    /**
     * Find a tag by name and owner ID
     */
    Optional<Tag> findByNameAndOwnerId(String name, Long ownerId);
    
    /**
     * Check if a tag exists with given name and owner
     */
    boolean existsByNameAndOwnerId(String name, Long ownerId);
    
    /**
     * Find all tags owned by a user
     */
    List<Tag> findByOwnerId(Long ownerId);
    
    /**
     * Find tags by name (containing search term) for a specific user
     */
    List<Tag> findByNameContainingAndOwnerId(String keyword, Long ownerId);
    
    // For backward compatibility during migration - can be removed later
    Optional<Tag> findByName(String name);
} 
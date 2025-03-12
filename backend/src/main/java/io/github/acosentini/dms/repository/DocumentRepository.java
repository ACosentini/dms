package io.github.acosentini.dms.repository;

import io.github.acosentini.dms.model.Document;
import io.github.acosentini.dms.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByOwner(User owner);
    
    @Query("SELECT d FROM Document d JOIN d.tags t WHERE t.name = :tagName AND d.owner.id = :userId")
    List<Document> findByTagNameAndUserId(@Param("tagName") String tagName, @Param("userId") Long userId);
    
    @Query("SELECT d FROM Document d WHERE d.name LIKE %:keyword% AND d.owner.id = :userId")
    List<Document> searchByNameAndUserId(@Param("keyword") String keyword, @Param("userId") Long userId);
    
    @Query("SELECT d FROM Document d WHERE d.contentType LIKE %:contentType% AND d.owner.id = :userId")
    List<Document> findByContentTypeAndUserId(@Param("contentType") String contentType, @Param("userId") Long userId);
    
    Page<Document> findByOwnerId(Long userId, Pageable pageable);
    
    Page<Document> findByTagsId(Long tagId, Pageable pageable);
    
    Page<Document> findByNameContainingOrDescriptionContaining(String name, String description, Pageable pageable);
} 
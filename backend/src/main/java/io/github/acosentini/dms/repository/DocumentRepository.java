package io.github.acosentini.dms.repository;

import io.github.acosentini.dms.model.Document;
import io.github.acosentini.dms.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
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

    @Query("SELECT DISTINCT d FROM Document d JOIN d.tags t WHERE d.owner.id = :userId AND t.id IN :tagIds")
    Page<Document> findByOwnerIdAndTagsIdIn(
        @Param("userId") Long userId,
        @Param("tagIds") List<Long> tagIds,
        Pageable pageable
    );
    
    Page<Document> findByOwnerId(Long userId, Pageable pageable);
    
    Page<Document> findByTagsId(Long tagId, Pageable pageable);
    
    Page<Document> findByNameContaining(String name, Pageable pageable);

    @Query("SELECT DISTINCT d FROM Document d " +
           "LEFT JOIN d.tags t " +
           "WHERE d.owner.id = :userId " +
           "AND (" +
           "   LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "   OR LOWER(d.contentType) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "   OR EXISTS (SELECT 1 FROM d.tags tag WHERE LOWER(tag.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
           ")")
    Page<Document> searchDocuments(
        @Param("searchTerm") String searchTerm,
        @Param("userId") Long userId,
        Pageable pageable
    );

    @Query("SELECT d FROM Document d " +
           "WHERE d.owner.id = :userId " +
           "AND d.uploadDate BETWEEN :startDate AND :endDate")
    Page<Document> findByDateRange(
        @Param("userId") Long userId,
        @Param("startDate") ZonedDateTime startDate,
        @Param("endDate") ZonedDateTime endDate,
        Pageable pageable
    );
} 
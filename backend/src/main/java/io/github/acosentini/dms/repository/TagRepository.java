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
    Optional<Tag> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT t FROM Tag t JOIN t.documents d WHERE d.owner.id = :userId GROUP BY t")
    List<Tag> findTagsByUserId(@Param("userId") Long userId);

    List<Tag> findByNameContaining(String keyword);
} 
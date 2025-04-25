package io.github.acosentini.dms.model;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "encrypted_path")
    private String encryptedPath;
    
    @Column
    private Long size;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "upload_date")
    private ZonedDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "document_tags",
        joinColumns = @JoinColumn(name = "document_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    // Constructors
    public Document() {
    }

    public Document(String name, String encryptedPath, String contentType, Long size, User owner) {
        this.name = name;
        this.encryptedPath = encryptedPath;
        this.contentType = contentType;
        this.size = size;
        this.owner = owner;
        this.uploadDate = ZonedDateTime.now(ZoneOffset.UTC);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
    
    public String getEncryptedPath() {
        return encryptedPath;
    }

    public void setEncryptedPath(String encryptedPath) {
        this.encryptedPath = encryptedPath;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public ZonedDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(ZonedDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    // Helper methods for tag management
    public void addTag(Tag tag) {
        tags.add(tag);
        tag.getDocuments().add(this);
    }

    public void removeTag(Tag tag) {
        tags.remove(tag);
        tag.getDocuments().remove(this);
    }
} 
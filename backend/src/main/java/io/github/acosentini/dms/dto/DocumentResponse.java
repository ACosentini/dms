package io.github.acosentini.dms.dto;

import java.time.ZonedDateTime;
import java.util.Set;

public class DocumentResponse {
    
    private Long id;
    private String name;
    private String contentType;
    private ZonedDateTime uploadDate;
    private Set<Long> tagIds;

    public DocumentResponse() {
    }

    public DocumentResponse(Long id, String name, String contentType, ZonedDateTime uploadDate, Set<Long> tagIds) {
        this.id = id;
        this.name = name;
        this.contentType = contentType;
        this.uploadDate = uploadDate;
        this.tagIds = tagIds;
    }

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

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public ZonedDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(ZonedDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public Set<Long> getTagIds() {
        return tagIds;
    }

    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }
} 
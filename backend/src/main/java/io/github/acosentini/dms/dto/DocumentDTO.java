package io.github.acosentini.dms.dto;

import java.util.Set;

public class DocumentDTO {
    
    private String name;
    private String description;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private Set<Long> tagIds;
    
    public DocumentDTO() {
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public Set<Long> getTagIds() {
        return tagIds;
    }
    
    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }
} 
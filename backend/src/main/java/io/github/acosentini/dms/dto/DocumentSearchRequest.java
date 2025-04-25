package io.github.acosentini.dms.dto;

import java.time.ZonedDateTime;
import java.util.List;

public class DocumentSearchRequest {
    private String searchTerm;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private List<Long> tagIds;
    private Integer page;
    private Integer size;
    
    public DocumentSearchRequest() {
    }
    
    public String getSearchTerm() {
        return searchTerm;
    }
    
    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }
    
    public ZonedDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(ZonedDateTime startDate) {
        this.startDate = startDate;
    }
    
    public ZonedDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(ZonedDateTime endDate) {
        this.endDate = endDate;
    }
    
    public List<Long> getTagIds() {
        return tagIds;
    }
    
    public void setTagIds(List<Long> tagIds) {
        this.tagIds = tagIds;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getSize() {
        return size;
    }
    
    public void setSize(Integer size) {
        this.size = size;
    }
}
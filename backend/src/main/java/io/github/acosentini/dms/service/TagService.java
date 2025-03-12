package io.github.acosentini.dms.service;

import io.github.acosentini.dms.model.Tag;
import io.github.acosentini.dms.repository.TagRepository;
import io.github.acosentini.dms.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;
    
    /**
     * Create a new tag
     * 
     * @param tag The tag to create
     * @return The created tag
     */
    public Tag createTag(Tag tag) {
        // Check if tag with same name already exists
        if (tagRepository.findByName(tag.getName()).isPresent()) {
            throw new IllegalArgumentException("Tag with name '" + tag.getName() + "' already exists");
        }
        
        return tagRepository.save(tag);
    }
    
    /**
     * Get tag by ID
     * 
     * @param id The tag ID
     * @return The tag
     */
    public Tag getTagById(Long id) {
        return tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
    }
    
    /**
     * Get tag by name
     * 
     * @param name The tag name
     * @return The tag
     */
    public Tag getTagByName(String name) {
        return tagRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with name: " + name));
    }
    
    /**
     * Get all tags
     * 
     * @return List of all tags
     */
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }
    
    /**
     * Update tag
     * 
     * @param id The tag ID
     * @param tagDetails The updated tag details
     * @return The updated tag
     */
    public Tag updateTag(Long id, Tag tagDetails) {
        Tag tag = getTagById(id);
        
        // Check if new name already exists for another tag
        if (!tag.getName().equals(tagDetails.getName()) && 
            tagRepository.findByName(tagDetails.getName()).isPresent()) {
            throw new IllegalArgumentException("Tag with name '" + tagDetails.getName() + "' already exists");
        }
        
        tag.setName(tagDetails.getName());
        
        return tagRepository.save(tag);
    }
    
    /**
     * Delete tag
     * 
     * @param id The tag ID
     */
    @Transactional
    public void deleteTag(Long id) {
        Tag tag = getTagById(id);
        
        // Remove tag from all documents
        tag.getDocuments().forEach(document -> document.getTags().remove(tag));
        
        tagRepository.delete(tag);
    }
    
    /**
     * Search tags by name
     * 
     * @param keyword The search keyword
     * @return List of matching tags
     */
    public List<Tag> searchTags(String keyword) {
        return tagRepository.findByNameContaining(keyword);
    }
    
    /**
     * Check if tag exists by name
     * 
     * @param name The tag name
     * @return true if tag exists, false otherwise
     */
    public boolean existsByName(String name) {
        return tagRepository.findByName(name).isPresent();
    }
    
    /**
     * Get or create tag by name
     * 
     * @param name The tag name
     * @return The existing or newly created tag
     */
    @Transactional
    public Tag getOrCreateTag(String name) {
        return tagRepository.findByName(name)
            .orElseGet(() -> {
                Tag newTag = new Tag();
                newTag.setName(name);
                return tagRepository.save(newTag);
            });
    }
} 
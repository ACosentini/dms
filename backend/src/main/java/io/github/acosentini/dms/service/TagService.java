package io.github.acosentini.dms.service;

import io.github.acosentini.dms.model.Tag;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.repository.TagRepository;
import io.github.acosentini.dms.repository.UserRepository;
import io.github.acosentini.dms.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new tag for a specific user
     * 
     * @param tag The tag to create
     * @param userId The ID of the user creating the tag
     * @return The created tag
     */
    public Tag createTag(Tag tag, Long userId) {
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Check if tag with same name already exists for this user
        if (tagRepository.findByNameAndOwnerId(tag.getName(), userId).isPresent()) {
            throw new IllegalArgumentException("Tag with name '" + tag.getName() + "' already exists for this user");
        }
        
        tag.setOwner(owner);
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
     * Get tag by name for a specific user
     * 
     * @param name The tag name
     * @param userId The user ID
     * @return The tag
     */
    public Tag getTagByNameAndUser(String name, Long userId) {
        return tagRepository.findByNameAndOwnerId(name, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with name: " + name));
    }
    
    /**
     * Get all tags for a specific user
     * 
     * @param userId The user ID
     * @return List of tags owned by the user
     */
    public List<Tag> getTagsByUserId(Long userId) {
        return tagRepository.findByOwnerId(userId);
    }
    
    /**
     * Update tag
     * 
     * @param id The tag ID
     * @param tagDetails The updated tag details
     * @param userId The ID of the user updating the tag
     * @return The updated tag
     */
    public Tag updateTag(Long id, Tag tagDetails, Long userId) {
        Tag tag = getTagById(id);
        
        // Verify ownership
        if (!tag.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to update this tag");
        }
        
        // Check if new name already exists for another tag owned by this user
        if (!tag.getName().equals(tagDetails.getName()) && 
            tagRepository.findByNameAndOwnerId(tagDetails.getName(), userId).isPresent()) {
            throw new IllegalArgumentException("Tag with name '" + tagDetails.getName() + "' already exists");
        }
        
        tag.setName(tagDetails.getName());
        
        return tagRepository.save(tag);
    }
    
    /**
     * Delete tag
     * 
     * @param id The tag ID
     * @param userId The ID of the user deleting the tag
     */
    @Transactional
    public void deleteTag(Long id, Long userId) {
        Tag tag = getTagById(id);
        
        // Verify ownership
        if (!tag.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this tag");
        }
        
        // Remove tag from all documents
        tag.getDocuments().forEach(document -> document.getTags().remove(tag));
        
        tagRepository.delete(tag);
    }
    
    /**
     * Search tags by name for a specific user
     * 
     * @param keyword The search keyword
     * @param userId The user ID
     * @return List of matching tags owned by the user
     */
    public List<Tag> searchTagsByUser(String keyword, Long userId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getTagsByUserId(userId);
        }
        return tagRepository.findByNameContainingAndOwnerId(keyword, userId);
    }
    
    /**
     * Get or create tag for a specific user
     * 
     * @param name The tag name
     * @param userId The user ID
     * @return The existing or newly created tag
     */
    @Transactional
    public Tag getOrCreateTag(String name, Long userId) {
        return tagRepository.findByNameAndOwnerId(name, userId)
            .orElseGet(() -> {
                User owner = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
                Tag newTag = new Tag();
                newTag.setName(name);
                newTag.setOwner(owner);
                return tagRepository.save(newTag);
            });
    }
} 
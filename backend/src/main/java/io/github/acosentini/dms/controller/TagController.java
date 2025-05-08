package io.github.acosentini.dms.controller;

import io.github.acosentini.dms.dto.TagResponse;
import io.github.acosentini.dms.model.Tag;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.service.TagService;
import io.github.acosentini.dms.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tags")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TagController {

    @Autowired
    private TagService tagService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get tags owned by this user
        List<Tag> tags = tagService.getTagsByUserId(user.getId());
        
        List<TagResponse> response = tags.stream()
            .map(tag -> new TagResponse(tag.getId(), tag.getName()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(@PathVariable Long id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        Tag tag = tagService.getTagById(id);
        
        // Verify tag ownership
        if (!tag.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        TagResponse response = new TagResponse(tag.getId(), tag.getName());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody Tag tag) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        Tag createdTag = tagService.createTag(tag, user.getId());
        
        TagResponse response = new TagResponse(createdTag.getId(), createdTag.getName());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable Long id, @Valid @RequestBody Tag tagDetails) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        try {
            Tag updatedTag = tagService.updateTag(id, tagDetails, user.getId());
            
            TagResponse response = new TagResponse(updatedTag.getId(), updatedTag.getName());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // This will happen if the tag doesn't belong to the user
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable Long id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        try {
            tagService.deleteTag(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            // This will happen if the tag doesn't belong to the user
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TagResponse>> searchTags(@RequestParam String keyword) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Search tags owned by this user
        List<Tag> tags = tagService.searchTagsByUser(keyword, user.getId());
        
        List<TagResponse> response = tags.stream()
            .map(tag -> new TagResponse(tag.getId(), tag.getName()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
} 
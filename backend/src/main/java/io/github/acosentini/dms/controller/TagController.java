package io.github.acosentini.dms.controller;

import io.github.acosentini.dms.dto.TagResponse;
import io.github.acosentini.dms.model.Tag;
import io.github.acosentini.dms.service.TagService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TagController {

    @Autowired
    private TagService tagService;
    
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        List<Tag> tags = tagService.getAllTags();
        
        List<TagResponse> response = tags.stream()
            .map(tag -> new TagResponse(tag.getId(), tag.getName()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(@PathVariable Long id) {
        Tag tag = tagService.getTagById(id);
        
        TagResponse response = new TagResponse(tag.getId(), tag.getName());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody Tag tag) {
        Tag createdTag = tagService.createTag(tag);
        
        TagResponse response = new TagResponse(createdTag.getId(), createdTag.getName());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable Long id, @Valid @RequestBody Tag tagDetails) {
        Tag updatedTag = tagService.updateTag(id, tagDetails);
        
        TagResponse response = new TagResponse(updatedTag.getId(), updatedTag.getName());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TagResponse>> searchTags(@RequestParam String keyword) {
        List<Tag> tags = tagService.searchTags(keyword);
        
        List<TagResponse> response = tags.stream()
            .map(tag -> new TagResponse(tag.getId(), tag.getName()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
} 
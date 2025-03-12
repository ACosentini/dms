package io.github.acosentini.dms.controller;

import io.github.acosentini.dms.dto.DocumentDTO;
import io.github.acosentini.dms.dto.DocumentResponse;
import io.github.acosentini.dms.model.Document;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.service.DocumentService;
import io.github.acosentini.dms.service.FileStorageService;
import io.github.acosentini.dms.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {

    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "tagIds", required = false) List<Long> tagIds) {
        
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.getUserByUsername(username);
            
            // Store file
            String filePath = fileStorageService.storeFile(file);
            
            // Create document DTO
            DocumentDTO documentDTO = new DocumentDTO();
            documentDTO.setName(name);
            documentDTO.setFilePath(filePath);
            documentDTO.setFileSize(file.getSize());
            documentDTO.setFileType(file.getContentType());
            if (tagIds != null && !tagIds.isEmpty()) {
                documentDTO.setTagIds(tagIds.stream().collect(Collectors.toSet()));
            }
            
            // Create document
            Document document = documentService.createDocument(documentDTO, user.getId());
            
            // Create response
            DocumentResponse response = new DocumentResponse(
                document.getId(),
                document.getName(),
                document.getContentType(),
                document.getUploadDate(),
                document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<Page<DocumentResponse>> getAllDocuments(Pageable pageable) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get documents for user
        Page<Document> documents = documentService.getDocumentsByUserId(user.getId(), pageable);
        
        // Map to response
        Page<DocumentResponse> response = documents.map(document -> new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getContentType(),
            document.getUploadDate(),
            document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable Long id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(id);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Create response
        DocumentResponse response = new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getContentType(),
            document.getUploadDate(),
            document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, HttpServletRequest request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(id);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Load file as resource
        Resource resource = fileStorageService.loadFileAsResource(document.getEncryptedPath());
        
        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Fallback to the document's content type
            contentType = document.getContentType();
        }
        
        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getName() + "\"")
            .body(resource);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentDTO documentDTO) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(id);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Update document
        document = documentService.updateDocument(id, documentDTO);
        
        // Create response
        DocumentResponse response = new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getContentType(),
            document.getUploadDate(),
            document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
        );
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(id);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Delete document
        documentService.deleteDocument(id);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> searchDocuments(
            @RequestParam String keyword,
            Pageable pageable) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Search documents
        Page<Document> documents = documentService.searchDocuments(keyword, pageable);
        
        // Filter documents by user and convert to list
        List<DocumentResponse> response = documents.getContent().stream()
            .filter(document -> document.getOwner() != null && document.getOwner().getId().equals(user.getId()))
            .map(document -> new DocumentResponse(
                document.getId(),
                document.getName(),
                document.getContentType(),
                document.getUploadDate(),
                document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/tag/{tagId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByTag(
            @PathVariable Long tagId,
            Pageable pageable) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get documents by tag
        Page<Document> documents = documentService.getDocumentsByTagId(tagId, pageable);
        
        // Filter documents by user and convert to list
        List<DocumentResponse> response = documents.getContent().stream()
            .filter(document -> document.getOwner() != null && document.getOwner().getId().equals(user.getId()))
            .map(document -> new DocumentResponse(
                document.getId(),
                document.getName(),
                document.getContentType(),
                document.getUploadDate(),
                document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{documentId}/tags/{tagId}")
    public ResponseEntity<DocumentResponse> addTagToDocument(
            @PathVariable Long documentId,
            @PathVariable Long tagId) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(documentId);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Add tag to document
        document = documentService.addTagToDocument(documentId, tagId);
        
        // Create response
        DocumentResponse response = new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getContentType(),
            document.getUploadDate(),
            document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
        );
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{documentId}/tags/{tagId}")
    public ResponseEntity<DocumentResponse> removeTagFromDocument(
            @PathVariable Long documentId,
            @PathVariable Long tagId) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Get document
        Document document = documentService.getDocumentById(documentId);
        
        // Check if document belongs to user
        if (!document.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Remove tag from document
        document = documentService.removeTagFromDocument(documentId, tagId);
        
        // Create response
        DocumentResponse response = new DocumentResponse(
            document.getId(),
            document.getName(),
            document.getContentType(),
            document.getUploadDate(),
            document.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet())
        );
        
        return ResponseEntity.ok(response);
    }
} 
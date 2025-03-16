package io.github.acosentini.dms.service;

import io.github.acosentini.dms.model.Document;
import io.github.acosentini.dms.model.Tag;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.repository.DocumentRepository;
import io.github.acosentini.dms.exception.ResourceNotFoundException;
import io.github.acosentini.dms.dto.DocumentDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TagService tagService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Create a new document
     * 
     * @param documentDTO The document data transfer object
     * @param userId The ID of the user who owns the document
     * @return The created document
     */
    @Transactional
    public Document createDocument(DocumentDTO documentDTO, Long userId) {
        User user = userService.getUserById(userId);
        
        Document document = new Document();
        document.setName(documentDTO.getName());
        document.setEncryptedPath(documentDTO.getFilePath());
        document.setSize(documentDTO.getFileSize());
        document.setContentType(documentDTO.getFileType());
        document.setUploadDate(LocalDateTime.now());
        document.setOwner(user);
        
        // Process tags
        if (documentDTO.getTagIds() != null && !documentDTO.getTagIds().isEmpty()) {
            Set<Tag> tags = documentDTO.getTagIds().stream()
                .map(tagId -> tagService.getTagById(tagId))
                .collect(Collectors.toSet());
            document.setTags(tags);
        }
        
        return documentRepository.save(document);
    }
    
    /**
     * Get document by ID
     * 
     * @param id The document ID
     * @return The document
     */
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }
    
    /**
     * Get all documents
     * 
     * @param pageable Pagination information
     * @return Page of documents
     */
    public Page<Document> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable);
    }
    
    /**
     * Get documents by user ID
     * 
     * @param userId The user ID
     * @param pageable Pagination information
     * @return Page of documents
     */
    public Page<Document> getDocumentsByUserId(Long userId, Pageable pageable) {
        return documentRepository.findByOwnerId(userId, pageable);
    }
    
    /**
     * Get documents by tag ID
     * 
     * @param tagId The tag ID
     * @param pageable Pagination information
     * @return Page of documents
     */
    public Page<Document> getDocumentsByTagId(Long tagId, Pageable pageable) {
        return documentRepository.findByTagsId(tagId, pageable);
    }
    
    /**
     * Search documents by name
     * 
     * @param keyword The search keyword
     * @param pageable Pagination information
     * @return Page of documents
     */
    public Page<Document> searchDocuments(String keyword, Pageable pageable) {
        return documentRepository.findByNameContaining(keyword, pageable);
    }
    
    /**
     * Update document
     * 
     * @param id The document ID
     * @param documentDTO The updated document details
     * @return The updated document
     */
    @Transactional
    public Document updateDocument(Long id, DocumentDTO documentDTO) {
        Document document = getDocumentById(id);
        
        document.setName(documentDTO.getName());
        document.setEncryptedPath(documentDTO.getFilePath());
        
        // Update tags if provided
        if (documentDTO.getTagIds() != null) {
            Set<Tag> tags = documentDTO.getTagIds().stream()
                .map(tagId -> tagService.getTagById(tagId))
                .collect(Collectors.toSet());
            document.setTags(tags);
        }
        
        return documentRepository.save(document);
    }
    
    /**
     * Delete document
     * 
     * @param id The document ID
     */
    @Transactional
    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        
        // Delete the actual file from storage
        fileStorageService.deleteFile(document.getEncryptedPath());
        
        // Delete document from database
        documentRepository.delete(document);
    }
    
    /**
     * Add tag to document
     * 
     * @param documentId The document ID
     * @param tagId The tag ID
     * @return The updated document
     */
    @Transactional
    public Document addTagToDocument(Long documentId, Long tagId) {
        Document document = getDocumentById(documentId);
        Tag tag = tagService.getTagById(tagId);
        
        document.getTags().add(tag);
        return documentRepository.save(document);
    }
    
    /**
     * Remove tag from document
     * 
     * @param documentId The document ID
     * @param tagId The tag ID
     * @return The updated document
     */
    @Transactional
    public Document removeTagFromDocument(Long documentId, Long tagId) {
        Document document = getDocumentById(documentId);
        Tag tag = tagService.getTagById(tagId);
        
        document.getTags().remove(tag);
        return documentRepository.save(document);
    }
} 
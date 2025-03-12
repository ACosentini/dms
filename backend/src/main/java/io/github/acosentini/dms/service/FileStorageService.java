package io.github.acosentini.dms.service;

import io.github.acosentini.dms.config.FileStorageProperties;
import io.github.acosentini.dms.exception.FileStorageException;
import io.github.acosentini.dms.exception.FileNotFoundException;
import io.github.acosentini.dms.util.EncryptionUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Autowired
    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    
    /**
     * Store a file in the filesystem
     * 
     * @param file The file to store
     * @return The encrypted file path
     */
    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Check if the file's name contains invalid characters
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }
            
            // Generate a unique file name to prevent overwriting
            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // Copy file to the target location (replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Encrypt the file path before storing in database
            String encryptedFilePath = encryptionUtil.encrypt(uniqueFileName);
            
            return encryptedFilePath;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
    
    /**
     * Load a file as a resource
     * 
     * @param encryptedFilePath The encrypted file path
     * @return The file resource
     */
    public Resource loadFileAsResource(String encryptedFilePath) {
        try {
            // Decrypt the file path
            String decryptedFilePath = encryptionUtil.decrypt(encryptedFilePath);
            
            Path filePath = this.fileStorageLocation.resolve(decryptedFilePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found: " + encryptedFilePath);
            }
        } catch (MalformedURLException ex) {
            throw new FileNotFoundException("File not found: " + encryptedFilePath, ex);
        }
    }
    
    /**
     * Delete a file
     * 
     * @param encryptedFilePath The encrypted file path
     * @return true if file was deleted, false otherwise
     */
    public boolean deleteFile(String encryptedFilePath) {
        try {
            // Decrypt the file path
            String decryptedFilePath = encryptionUtil.decrypt(encryptedFilePath);
            
            Path filePath = this.fileStorageLocation.resolve(decryptedFilePath).normalize();
            
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file: " + encryptedFilePath, ex);
        }
    }
    
    /**
     * Get file size
     * 
     * @param encryptedFilePath The encrypted file path
     * @return The file size in bytes
     */
    public long getFileSize(String encryptedFilePath) {
        try {
            // Decrypt the file path
            String decryptedFilePath = encryptionUtil.decrypt(encryptedFilePath);
            
            Path filePath = this.fileStorageLocation.resolve(decryptedFilePath).normalize();
            
            return Files.size(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not get file size: " + encryptedFilePath, ex);
        }
    }
    
    /**
     * Get file content type
     * 
     * @param encryptedFilePath The encrypted file path
     * @return The file content type
     */
    public String getFileContentType(String encryptedFilePath) {
        try {
            // Decrypt the file path
            String decryptedFilePath = encryptionUtil.decrypt(encryptedFilePath);
            
            Path filePath = this.fileStorageLocation.resolve(decryptedFilePath).normalize();
            
            return Files.probeContentType(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not determine file content type: " + encryptedFilePath, ex);
        }
    }
} 
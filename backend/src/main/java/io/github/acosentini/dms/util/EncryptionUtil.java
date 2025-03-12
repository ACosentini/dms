package io.github.acosentini.dms.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;

@Component
public class EncryptionUtil {

    @Value("${encryption.secret:defaultSecretKey}")
    private String secret;

    /**
     * Encrypts a string using AES encryption
     * 
     * @param data The string to encrypt
     * @return The encrypted string
     */
    public String encrypt(String data) {
        try {
            Key key = generateKey();
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encVal = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encVal);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    /**
     * Decrypts a string using AES encryption
     * 
     * @param encryptedData The encrypted string
     * @return The decrypted string
     */
    public String decrypt(String encryptedData) {
        try {
            Key key = generateKey();
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decodedValue = Base64.getDecoder().decode(encryptedData);
            byte[] decValue = cipher.doFinal(decodedValue);
            return new String(decValue, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }

    private Key generateKey() {
        // Ensure the key is 16, 24, or 32 bytes (AES-128, AES-192, or AES-256)
        byte[] keyBytes = new byte[16];
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        
        // Copy the secret bytes into keyBytes, up to 16 bytes
        System.arraycopy(secretBytes, 0, keyBytes, 0, Math.min(secretBytes.length, keyBytes.length));
        
        return new SecretKeySpec(keyBytes, "AES");
    }
} 
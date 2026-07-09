package com.hostel.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class PayloadEncryptionUtil {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private final SecretKeySpec secretKey;

    public PayloadEncryptionUtil(
            @Value("${app.security.payload.secret}") String secret) {
        
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length != 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
            keyBytes = padded;
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String decryptPayload(String payloadString) throws Exception {
        if (payloadString == null || !payloadString.contains(":")) {
            throw new IllegalArgumentException("Invalid encrypted payload format");
        }

        String[] parts = payloadString.split(":");
        byte[] iv = Base64.getDecoder().decode(parts[0]);
        byte[] cipherText = Base64.getDecoder().decode(parts[1]);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));

        byte[] plainText = cipher.doFinal(cipherText);
        return new String(plainText, StandardCharsets.UTF_8);
    }

    public String encryptPayload(String jsonResponse) throws Exception {
        if (jsonResponse == null || jsonResponse.isEmpty()) {
            return jsonResponse;
        }

        byte[] iv = new byte[16];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));

        byte[] cipherText = cipher.doFinal(jsonResponse.getBytes(StandardCharsets.UTF_8));

        String ivBase64 = Base64.getEncoder().encodeToString(iv);
        String cipherTextBase64 = Base64.getEncoder().encodeToString(cipherText);

        String combined = ivBase64 + ":" + cipherTextBase64;
        
        // Escape quotes in the combined string just in case, though it's base64
        return "{\"payload\":\"" + combined + "\"}";
    }
}

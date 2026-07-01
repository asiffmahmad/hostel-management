package com.hostel.backend.security;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public class EncryptionContext implements ApplicationContextAware {
    
    private static EncryptionService encryptionService;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        encryptionService = applicationContext.getBean(EncryptionService.class);
    }
    
    public static String encrypt(String plainText) {
        if (encryptionService == null) return plainText;
        return encryptionService.encrypt(plainText);
    }
    
    public static String decrypt(String encryptedText) {
        if (encryptionService == null) return encryptedText;
        return encryptionService.decrypt(encryptedText);
    }
    
    public static String hash(String plainText) {
        if (encryptionService == null) return plainText;
        return encryptionService.generateHash(plainText);
    }
    
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 10) return phone;
        return phone.substring(0, 5) + "XXXXX";
    }
}

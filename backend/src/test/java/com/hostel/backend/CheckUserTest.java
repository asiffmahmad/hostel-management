package com.hostel.backend;

import com.hostel.backend.entity.User;
import com.hostel.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
public class CheckUserTest {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    public void testUser() {
        System.out.println("================== USERS IN DB ==================");
        userRepository.findAll().forEach(u -> {
            System.out.println("User: " + u.getUsername() + ", Active: " + u.getIsActive() + ", PassHash: " + u.getPassword());
            System.out.println("Matches Owner@123: " + passwordEncoder.matches("Owner@123", u.getPassword()));
        });
        System.out.println("=================================================");
    }
}

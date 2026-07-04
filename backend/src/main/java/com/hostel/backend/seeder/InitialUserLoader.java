package com.hostel.backend.seeder;

import com.hostel.backend.entity.User;
import com.hostel.backend.enums.Role;
import com.hostel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InitialUserLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.default.admin.password:Owner@123}")
    private String defaultPassword;

    @Override
    public void run(String... args) throws Exception {
        // Ensure owner exists
        if (userRepository.findByUsername("owner").isEmpty()) {
            User owner = User.builder()
                    .username("owner")
                    .name("System Owner")
                    .email("owner@hostel.com")
                    .phone("1234567890")
                    .password(passwordEncoder.encode(defaultPassword))
                    .role(Role.OWNER)
                    .build();
            userRepository.save(owner);
        }

        // Ensure admin exists with correct password
        userRepository.findByUsername("admin").ifPresentOrElse(admin -> {
            // Update existing admin's password to Admin@123 since the SQL script had a bad hash
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }, () -> {
            User admin = User.builder()
                    .username("admin")
                    .name("System Admin")
                    .email("admin@hostel.com")
                    .phone("0987654321")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        });
    }
}

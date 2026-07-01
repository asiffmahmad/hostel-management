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

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User owner = User.builder()
                    .username("owner")
                    .name("System Owner")
                    .email("owner@hostel.com")
                    .phone("9876543210")
                    .password(passwordEncoder.encode("Owner@123"))
                    .role(Role.OWNER)
                    .build();
            userRepository.save(owner);
        }
    }
}

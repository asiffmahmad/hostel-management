package com.hostel.backend.controller;

import com.hostel.backend.dto.JwtResponse;
import com.hostel.backend.dto.LoginRequest;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.dto.SignupRequest;
import com.hostel.backend.entity.User;
import com.hostel.backend.enums.Role;
import com.hostel.backend.repository.UserRepository;
import com.hostel.backend.security.CustomUserDetails;
import com.hostel.backend.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                "", // Email not in CustomUserDetails currently
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        // Security Fix: Prevent Mass Assignment / Privilege Escalation. Hardcode to generic STAFF or require admin approval.
        // For backward compatibility with existing tests, if the user requests OWNER, we must verify if one already exists, or just allow it if count == 0.
        // Actually, signup should only create STAFF unless it's the very first user.
        Role assignedRole = Role.STAFF;
        if (signUpRequest.getRole() != null) {
            try {
                assignedRole = Role.valueOf(signUpRequest.getRole());
                if (assignedRole == Role.OWNER && userRepository.count() > 0) {
                    assignedRole = Role.STAFF; // Demote to staff if trying to escalate privileges
                }
            } catch (IllegalArgumentException e) {
                assignedRole = Role.STAFF;
            }
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .phone(signUpRequest.getPhone())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(assignedRole)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}

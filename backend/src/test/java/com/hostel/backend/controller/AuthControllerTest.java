package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.LoginRequest;
import com.hostel.backend.dto.SignupRequest;
import com.hostel.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.hostel.backend.repository.ExpenseRepository expenseRepository;

    @BeforeEach
    public void setup() {
        expenseRepository.deleteAll(); // Clean up expenses first due to foreign key constraint
        userRepository.deleteAll(); // Clean up users before each test
    }

    @Test
    public void testSignupAndLogin_Positive() throws Exception {
        // 1. Signup
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("testadmin");
        signupRequest.setPassword("password123");
        signupRequest.setName("Test Admin");
        signupRequest.setEmail("test@admin.com");
        signupRequest.setPhone("1234567890");
        signupRequest.setRole("ADMIN");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // 2. Login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testadmin");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testadmin"));
    }

    @Test
    public void testSignup_UsernameAlreadyExists_Negative() throws Exception {
        // Create user
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("existinguser");
        signupRequest.setPassword("password123");
        signupRequest.setName("Existing User");
        signupRequest.setPhone("0987654321");
        signupRequest.setRole("ADMIN");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Try to create again with same username
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Username is already taken!"));
    }

    @Test
    public void testLogin_InvalidCredentials_Negative() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("nonexistentuser");
        loginRequest.setPassword("wrongpassword");

        // Depending on Spring Security setup, it might return 401 Unauthorized or 403 Forbidden
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()); // In Spring Security, BadCredentialsException leads to 401
    }
}

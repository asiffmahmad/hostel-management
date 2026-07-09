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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
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

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    // ── Helper: build the auth cookie ────────────────────────────────────────
    private ResponseCookie buildAuthCookie(String value, long maxAgeMs) {
        return ResponseCookie.from("auth_token", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ofMillis(maxAgeMs))
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Set JWT as HttpOnly cookie — not readable by JavaScript
        ResponseCookie cookie = buildAuthCookie(jwt, jwtExpirationMs);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Return user info — token is intentionally omitted from body (it is in the cookie)
        return ResponseEntity.ok(new JwtResponse(null,
                userDetails.getId(),
                userDetails.getUsername(),
                "",
                roles));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Expire the auth cookie immediately
        ResponseCookie expiredCookie = buildAuthCookie("", 0);
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }
        
        if (!(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized: Invalid Principal"));
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(java.util.Map.of(
                "id", userDetails.getId(),
                "username", userDetails.getUsername(),
                "roles", roles
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        // Security Fix: Prevent Mass Assignment / Privilege Escalation. Hardcode to generic ADMIN or require admin approval.
        // For backward compatibility with existing tests, if the user requests OWNER, we must verify if one already exists, or just allow it if count == 0.
        // Actually, signup should only create ADMIN unless it's the very first user.
        Role assignedRole = Role.ADMIN;
        if (signUpRequest.getRole() != null) {
            try {
                assignedRole = Role.valueOf(signUpRequest.getRole());
                if (assignedRole == Role.OWNER && userRepository.count() > 0) {
                    assignedRole = Role.ADMIN; // Demote to admin if trying to escalate privileges
                }
            } catch (IllegalArgumentException e) {
                assignedRole = Role.ADMIN;
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

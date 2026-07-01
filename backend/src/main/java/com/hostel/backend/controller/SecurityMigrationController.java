package com.hostel.backend.controller;

import com.hostel.backend.service.SecurityMigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security-migration")
@RequiredArgsConstructor
public class SecurityMigrationController {

    private final SecurityMigrationService securityMigrationService;

    // Only allow ADMIN to run this migration
    @PostMapping("/run-phase2")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> runPhase2Migration() {
        try {
            securityMigrationService.runPhase2Migration();
            return ResponseEntity.ok("Phase 2 Security Migration (Data Encryption) completed successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Migration failed: " + e.getMessage());
        }
    }
}

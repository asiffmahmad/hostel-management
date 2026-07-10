package com.hostel.backend.controller;

import com.hostel.backend.dto.ExternalPaymentDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.service.ExternalPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-payments")
@RequiredArgsConstructor
public class ExternalPaymentController {

    private final ExternalPaymentService externalPaymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<ExternalPaymentDTO>> getAllExternalPayments(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        return ResponseEntity.ok(externalPaymentService.getAllExternalPayments(month, year));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<ExternalPaymentDTO>> getPendingExternalPayments() {
        return ResponseEntity.ok(externalPaymentService.getAllPendingExternalPayments());
    }

    @PostMapping("/validate-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<MessageResponse> validateAllPending() {
        return ResponseEntity.ok(externalPaymentService.validateAllPending());
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<MessageResponse> validatePayment(@PathVariable Long id) {
        return ResponseEntity.ok(externalPaymentService.validateExternalPayment(id));
    }
}

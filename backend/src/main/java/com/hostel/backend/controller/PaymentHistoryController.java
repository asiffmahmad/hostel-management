package com.hostel.backend.controller;

import com.hostel.backend.dto.PaymentHistoryDTO;
import com.hostel.backend.service.PaymentHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-history")
@RequiredArgsConstructor
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentHistoryDTO> recordPayment(@Valid @RequestBody PaymentHistoryDTO paymentHistoryDTO) {
        return new ResponseEntity<>(paymentHistoryService.recordPayment(paymentHistoryDTO), HttpStatus.CREATED);
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentHistoryDTO>> getPaymentHistoryByPaymentId(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentHistoryService.getPaymentHistoryByPaymentId(paymentId));
    }
}

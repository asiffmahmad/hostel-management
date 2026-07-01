package com.hostel.backend.controller;

import com.hostel.backend.dto.PaymentReceiptDTO;
import com.hostel.backend.service.PaymentReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-receipts")
@RequiredArgsConstructor
public class PaymentReceiptController {

    private final PaymentReceiptService paymentReceiptService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentReceiptDTO> generateReceipt(@Valid @RequestBody PaymentReceiptDTO paymentReceiptDTO) {
        return new ResponseEntity<>(paymentReceiptService.generateReceipt(paymentReceiptDTO), HttpStatus.CREATED);
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentReceiptDTO> getReceiptByPaymentId(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentReceiptService.getReceiptByPaymentId(paymentId));
    }
}

package com.hostel.backend.controller;

import com.hostel.backend.dto.*;
import com.hostel.backend.service.BankTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class BankTransactionController {

    private final BankTransactionService bankTransactionService;

    /**
     * Upload a bank statement file.
     * Replaces any existing transactions for the given month/year.
     *
     * POST /api/bank/upload?month=JULY&year=2026
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BankImportResultDTO> uploadStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam("month") String month,
            @RequestParam("year") String year) {

        BankImportResultDTO result = bankTransactionService.importStatement(file, month, year);
        return ResponseEntity.ok(result);
    }

    /**
     * Flexible search across all bank transactions.
     * At least one search criterion must be provided.
     *
     * GET /api/bank/search?utrNumber=618213397873
     * GET /api/bank/search?amount=5600&txnDate=2026-07-01
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BankTransactionDTO>> search(
            @RequestParam(required = false) String utrNumber,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate txnDate,
            @RequestParam(required = false) String reference) {

        List<BankTransactionDTO> results = bankTransactionService.search(utrNumber, amount, txnDate, reference);
        return ResponseEntity.ok(results);
    }

    /**
     * Get all transactions for a month/year.
     *
     * GET /api/bank/month?month=JULY&year=2026
     */
    @GetMapping("/month")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BankTransactionDTO>> getByMonth(
            @RequestParam String month,
            @RequestParam String year) {

        return ResponseEntity.ok(bankTransactionService.getByMonth(month, year));
    }

    /**
     * Get a single transaction by ID.
     *
     * GET /api/bank/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BankTransactionDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bankTransactionService.getById(id));
    }

    /**
     * Map a bank transaction to a student's payment.
     *
     * POST /api/bank/map-payment
     */
    @PostMapping("/map-payment")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentDTO> mapPayment(
            @Valid @RequestBody MapPaymentRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails != null) {
            request.setMappedBy(userDetails.getUsername());
        }
        PaymentDTO result = bankTransactionService.mapToPayment(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Delete all transactions for a given month/year (soft delete).
     * Used before re-importing a statement.
     *
     * DELETE /api/bank/month/JULY/2026
     */
    @DeleteMapping("/month/{month}/{year}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteByMonth(
            @PathVariable String month,
            @PathVariable String year) {

        bankTransactionService.deleteByMonth(month, year);
        return ResponseEntity.ok(new MessageResponse("Transactions deleted for " + month + "/" + year));
    }
}

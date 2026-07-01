package com.hostel.backend.controller;

import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.dto.BankTransactionGridFilterDTO;
import com.hostel.backend.dto.BankTransactionSummaryDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.service.BankTransactionGridService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-transactions")
@RequiredArgsConstructor
public class BankTransactionGridController {

    private final BankTransactionGridService bankTransactionGridService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Page<BankTransactionDTO>> getTransactions(
            @ModelAttribute BankTransactionGridFilterDTO filterDTO) {
        return ResponseEntity.ok(bankTransactionGridService.getBankTransactions(filterDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BankTransactionDTO> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(bankTransactionGridService.getBankTransactionById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "system";
        bankTransactionGridService.deleteBankTransaction(id, username);
        return ResponseEntity.ok(new MessageResponse("Transaction deleted successfully"));
    }

    @GetMapping("/month")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BankTransactionSummaryDTO> getMonthSummary(
            @RequestParam String month,
            @RequestParam String year) {
        return ResponseEntity.ok(bankTransactionGridService.getBankTransactionSummary(month, year));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BankTransactionDTO>> exportTransactions(
            @ModelAttribute BankTransactionGridFilterDTO filterDTO) {
        return ResponseEntity.ok(bankTransactionGridService.getBankTransactionsForExport(filterDTO));
    }
}

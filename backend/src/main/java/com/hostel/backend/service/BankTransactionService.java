package com.hostel.backend.service;

import com.hostel.backend.dto.BankImportResultDTO;
import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.dto.MapPaymentRequestDTO;
import com.hostel.backend.dto.PaymentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BankTransactionService {

    /** Upload and parse a bank statement; import credit transactions for given month/year. */
    BankImportResultDTO importStatement(MultipartFile file, String month, String year, String provider, String mode);

    /** Flexible search across utr, amount, date, reference. All params optional. */
    List<BankTransactionDTO> search(String utrNumber, BigDecimal amount, LocalDate txnDate, String reference);

    /** Get all transactions for a specific month/year. */
    List<BankTransactionDTO> getByMonth(String month, String year);

    /** Map a bank transaction to a student and create/update payment record. */
    PaymentDTO mapToPayment(MapPaymentRequestDTO request);
    void unmapPayment(Long bankTransactionId, String username);

    /** Soft-delete all transactions for a month/year (used before re-import). */
    void deleteByMonth(String month, String year);

    /** Get single transaction by ID. */
    BankTransactionDTO getById(Long id);
}

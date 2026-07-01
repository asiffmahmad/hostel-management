package com.hostel.backend.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents a single parsed transaction extracted from a bank statement.
 * Parser implementations populate these fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransaction {
    private String bankName;
    private String accountNumber;
    private LocalDate transactionDate;
    private LocalDate valueDate;
    private String description;
    private String utrNumber;
    private BigDecimal amount;
    private String transactionType; // CREDIT or DEBIT
    private BigDecimal credit;
    private BigDecimal debit;
    private BigDecimal balance;
    private String referenceNumber;
}

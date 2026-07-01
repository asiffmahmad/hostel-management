package com.hostel.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BankTransactionDTO {
    private Long id;
    private String bankName;
    private String accountNumber;
    private LocalDate transactionDate;
    private LocalDate valueDate;
    private String description;
    private String utrNumber;
    private BigDecimal amount;
    private String transactionType;
    private BigDecimal credit;
    private BigDecimal debit;
    private BigDecimal balance;
    private String referenceNumber;
    private String month;
    private String year;
    private String sourceFile;
    private LocalDateTime importedAt;
    private Boolean isMapped;
    private Long mappedPaymentId;
    private Long mappedStudentId;
    private LocalDateTime mappedAt;
    private String mappedBy;
}

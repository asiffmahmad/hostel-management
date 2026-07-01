package com.hostel.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BankTransactionSummaryDTO {
    private long totalTransactions;
    private long creditTransactions;
    private long debitTransactions;
    private long mappedTransactions;
    private long unmappedTransactions;
    private BigDecimal totalCreditAmount;
    private BigDecimal totalDebitAmount;
}

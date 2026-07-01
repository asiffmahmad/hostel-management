package com.hostel.backend.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BankTransactionGridFilterDTO {
    private String month;
    private String year;
    private String transactionType; // CREDIT / DEBIT
    private String utrNumber;
    private BigDecimal amount;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
    
    // Pagination and Sorting
    private int page = 0;
    private int size = 10;
    private String sortBy = "id";
    private String sortDir = "desc";
    
    // Global Search
    private String globalSearch;
}

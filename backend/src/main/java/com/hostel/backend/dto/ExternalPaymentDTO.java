package com.hostel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalPaymentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String phone;
    private String hostelName;
    private String month;
    private String year;
    private String utrNumber;
    private Double amount;
    private LocalDate transactionDate;
    private String validationStatus; // PENDING, VALIDATED, FAILED
    private String failureReason;
    private Double totalMonthDue;
    private Double totalMonthPaid;
    private String paymentStatus; // PENDING, PARTIALLY_PAID, PAID
}

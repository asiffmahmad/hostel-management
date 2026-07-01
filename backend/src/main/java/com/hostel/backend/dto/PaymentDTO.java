package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private Long id;

    @NotNull
    private Long studentId;

    // Read-only — populated by mapper for display convenience
    private String studentName;

    @NotNull
    private Double amount;

    @NotBlank
    private String month;

    @NotBlank
    private String year;

    private String status;
    private LocalDate dueDate;

    // ── UTR / Bank import fields ──
    private String utrNumber;
    private Long bankTransactionId;
    private String paymentSource;
    private String bankName;
    private LocalDateTime importedDate;
}


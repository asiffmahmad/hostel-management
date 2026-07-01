package com.hostel.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for mapping a bank transaction to a student payment.
 */
@Data
public class MapPaymentRequestDTO {

    @NotNull(message = "Bank transaction ID is required")
    private Long bankTransactionId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    /**
     * Optional: if null, a new payment record is created; 
     * if provided, the existing payment is updated.
     */
    private Long existingPaymentId;

    private String month;
    private String year;

    /** Username of the person performing the mapping (populated from JWT) */
    private String mappedBy;
}

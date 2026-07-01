package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseDTO {
    private Long id;

    @NotNull
    private Long hostelId;

    @NotBlank
    private String category;

    @NotNull
    private Double amount;

    @NotNull
    private LocalDate expenseDate;

    private String description;
    private String receiptUrl;
    
    @NotNull
    private Long recordedBy;
}

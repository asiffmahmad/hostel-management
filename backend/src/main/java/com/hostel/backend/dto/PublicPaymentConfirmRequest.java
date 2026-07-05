package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PublicPaymentConfirmRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotBlank(message = "UTR Number is required")
    private String utrNumber;
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    @NotBlank(message = "Month is required")
    private String month;
    
    @NotBlank(message = "Year is required")
    private String year;
}

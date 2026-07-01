package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PaymentReceiptDTO {
    private Long id;

    @NotNull
    private Long paymentId;

    @NotBlank
    private String receiptNumber;

    private String receiptUrl;

    @NotNull
    private LocalDate generatedDate;
}

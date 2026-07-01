package com.hostel.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PaymentHistoryDTO {
    private Long id;

    @NotNull
    private Long paymentId;

    @NotNull
    private Double amountPaid;

    @NotNull
    private LocalDate paymentDate;

    private String paymentMethod;
    private String referenceNumber;
}

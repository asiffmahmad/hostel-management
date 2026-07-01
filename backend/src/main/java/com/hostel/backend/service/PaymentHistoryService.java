package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentHistoryDTO;

import java.util.List;

public interface PaymentHistoryService {
    PaymentHistoryDTO recordPayment(PaymentHistoryDTO paymentHistoryDTO);
    List<PaymentHistoryDTO> getPaymentHistoryByPaymentId(Long paymentId);
}

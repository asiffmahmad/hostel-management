package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentReceiptDTO;

public interface PaymentReceiptService {
    PaymentReceiptDTO generateReceipt(PaymentReceiptDTO paymentReceiptDTO);
    PaymentReceiptDTO getReceiptByPaymentId(Long paymentId);
}

package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentDTO;
import java.util.List;
import java.util.Optional;

public interface PaymentService {
    PaymentDTO createPayment(PaymentDTO paymentDTO);
    PaymentDTO updatePayment(Long id, PaymentDTO paymentDTO);
    PaymentDTO getPaymentById(Long id);
    List<PaymentDTO> getPaymentsByStudentId(Long studentId);
    List<PaymentDTO> getAllPayments();
    void deletePayment(Long id);
    void generateMonthlyInvoices(String month, String year);
    Optional<PaymentDTO> searchByUtr(String utrNumber);
}


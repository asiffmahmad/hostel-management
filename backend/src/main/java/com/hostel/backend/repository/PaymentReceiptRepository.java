package com.hostel.backend.repository;

import com.hostel.backend.entity.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
    Optional<PaymentReceipt> findByPaymentId(Long paymentId);
    boolean existsByReceiptNumber(String receiptNumber);
}

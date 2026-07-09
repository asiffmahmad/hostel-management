package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentReceiptDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.PaymentReceipt;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.PaymentReceiptMapper;
import com.hostel.backend.repository.PaymentReceiptRepository;
import com.hostel.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentReceiptServiceImpl implements PaymentReceiptService {

    private final PaymentReceiptRepository paymentReceiptRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentReceiptMapper paymentReceiptMapper;

    @Override
    public PaymentReceiptDTO generateReceipt(PaymentReceiptDTO paymentReceiptDTO) {
        if (paymentReceiptRepository.existsByReceiptNumber(paymentReceiptDTO.getReceiptNumber())) {
            throw new IllegalArgumentException("Receipt number already exists");
        }

        Payment payment = paymentRepository.findById(paymentReceiptDTO.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        PaymentReceipt receipt = paymentReceiptMapper.toEntity(paymentReceiptDTO);
        receipt.setPayment(payment);

        PaymentReceipt savedReceipt = paymentReceiptRepository.save(receipt);
        return paymentReceiptMapper.toDto(savedReceipt);
    }

    @Override
    public PaymentReceiptDTO getReceiptByPaymentId(Long paymentId) {
        PaymentReceipt receipt = paymentReceiptRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found for this payment"));
        return paymentReceiptMapper.toDto(receipt);
    }
}

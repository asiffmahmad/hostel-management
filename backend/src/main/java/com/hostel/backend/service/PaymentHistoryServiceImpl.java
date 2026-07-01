package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentHistoryDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.PaymentHistory;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.PaymentHistoryMapper;
import com.hostel.backend.repository.PaymentHistoryRepository;
import com.hostel.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentHistoryServiceImpl implements PaymentHistoryService {

    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentHistoryMapper paymentHistoryMapper;

    @Override
    public PaymentHistoryDTO recordPayment(PaymentHistoryDTO paymentHistoryDTO) {
        Payment payment = paymentRepository.findById(paymentHistoryDTO.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        PaymentHistory history = paymentHistoryMapper.toEntity(paymentHistoryDTO);
        history.setPayment(payment);

        PaymentHistory savedHistory = paymentHistoryRepository.save(history);
        
        // Update main payment status if fully paid (simplified logic)
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        return paymentHistoryMapper.toDto(savedHistory);
    }

    @Override
    public List<PaymentHistoryDTO> getPaymentHistoryByPaymentId(Long paymentId) {
        return paymentHistoryRepository.findByPaymentId(paymentId).stream()
                .map(paymentHistoryMapper::toDto)
                .collect(Collectors.toList());
    }
}

package com.hostel.backend.mapper;

import com.hostel.backend.dto.PaymentHistoryDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.PaymentHistory;
import org.springframework.stereotype.Component;

@Component
public class PaymentHistoryMapper {

    public PaymentHistoryDTO toDto(PaymentHistory entity) {
        if (entity == null) {
            return null;
        }

        PaymentHistoryDTO dto = new PaymentHistoryDTO();
        dto.setId(entity.getId());
        
        if (entity.getPayment() != null) {
            dto.setPaymentId(entity.getPayment().getId());
        }
        
        dto.setAmountPaid(entity.getAmountPaid());
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setReferenceNumber(entity.getReferenceNumber());

        return dto;
    }

    public PaymentHistory toEntity(PaymentHistoryDTO dto) {
        if (dto == null) {
            return null;
        }

        PaymentHistory entity = new PaymentHistory();
        entity.setId(dto.getId());

        if (dto.getPaymentId() != null) {
            Payment payment = new Payment();
            payment.setId(dto.getPaymentId());
            entity.setPayment(payment);
        }

        entity.setAmountPaid(dto.getAmountPaid());
        entity.setPaymentDate(dto.getPaymentDate());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setReferenceNumber(dto.getReferenceNumber());

        return entity;
    }
}

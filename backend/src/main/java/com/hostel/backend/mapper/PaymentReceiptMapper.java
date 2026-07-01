package com.hostel.backend.mapper;

import com.hostel.backend.dto.PaymentReceiptDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.PaymentReceipt;
import org.springframework.stereotype.Component;

@Component
public class PaymentReceiptMapper {

    public PaymentReceiptDTO toDto(PaymentReceipt entity) {
        if (entity == null) {
            return null;
        }

        PaymentReceiptDTO dto = new PaymentReceiptDTO();
        dto.setId(entity.getId());
        
        if (entity.getPayment() != null) {
            dto.setPaymentId(entity.getPayment().getId());
        }
        
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setReceiptUrl(entity.getReceiptUrl());
        dto.setGeneratedDate(entity.getGeneratedDate());

        return dto;
    }

    public PaymentReceipt toEntity(PaymentReceiptDTO dto) {
        if (dto == null) {
            return null;
        }

        PaymentReceipt entity = new PaymentReceipt();
        entity.setId(dto.getId());

        if (dto.getPaymentId() != null) {
            Payment payment = new Payment();
            payment.setId(dto.getPaymentId());
            entity.setPayment(payment);
        }

        entity.setReceiptNumber(dto.getReceiptNumber());
        entity.setReceiptUrl(dto.getReceiptUrl());
        entity.setGeneratedDate(dto.getGeneratedDate());

        return entity;
    }
}

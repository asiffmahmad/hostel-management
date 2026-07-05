package com.hostel.backend.mapper;

import com.hostel.backend.dto.PaymentDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentDTO toDto(Payment entity) {
        if (entity == null) return null;

        PaymentDTO dto = new PaymentDTO();
        dto.setId(entity.getId());

        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
            dto.setStudentName(entity.getStudent().getName());
        }

        dto.setAmount(entity.getAmount());
        dto.setExpectedAmount(entity.getExpectedAmount());
        dto.setDueAmount(entity.getDueAmount());
        dto.setMonth(entity.getMonth());
        dto.setYear(entity.getYear());
        dto.setStatus(entity.getStatus());
        dto.setDueDate(entity.getDueDate());

        // UTR / Bank fields
        dto.setUtrNumber(entity.getUtrNumber());
        dto.setBankTransactionId(entity.getBankTransactionId());
        dto.setPaymentSource(entity.getPaymentSource());
        dto.setBankName(entity.getBankName());
        dto.setImportedDate(entity.getImportedDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    public Payment toEntity(PaymentDTO dto) {
        if (dto == null) return null;

        Payment entity = new Payment();
        entity.setId(dto.getId());

        if (dto.getStudentId() != null) {
            Student student = new Student();
            student.setId(dto.getStudentId());
            entity.setStudent(student);
        }

        entity.setAmount(dto.getAmount() != null ? dto.getAmount() : 0.0);
        entity.setExpectedAmount(dto.getExpectedAmount() != null ? dto.getExpectedAmount() : 0.0);
        entity.setDueAmount(dto.getDueAmount() != null ? dto.getDueAmount() : 0.0);
        entity.setMonth(dto.getMonth());
        entity.setYear(dto.getYear());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        entity.setDueDate(dto.getDueDate());

        // UTR / Bank fields
        entity.setUtrNumber(dto.getUtrNumber() != null && dto.getUtrNumber().isBlank() ? null : dto.getUtrNumber());
        entity.setBankTransactionId(dto.getBankTransactionId());
        entity.setPaymentSource(dto.getPaymentSource() != null ? dto.getPaymentSource() : "MANUAL");
        entity.setBankName(dto.getBankName());
        entity.setImportedDate(dto.getImportedDate());

        return entity;
    }
}


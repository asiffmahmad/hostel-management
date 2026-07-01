package com.hostel.backend.mapper;

import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.entity.BankTransaction;
import org.springframework.stereotype.Component;

@Component
public class BankTransactionMapper {

    public BankTransactionDTO toDto(BankTransaction entity) {
        if (entity == null) return null;

        BankTransactionDTO dto = new BankTransactionDTO();
        dto.setId(entity.getId());
        dto.setBankName(entity.getBankName());
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setTransactionDate(entity.getTransactionDate());
        dto.setValueDate(entity.getValueDate());
        dto.setDescription(entity.getDescription());
        dto.setUtrNumber(entity.getUtrNumber());
        dto.setAmount(entity.getAmount());
        dto.setTransactionType(entity.getTransactionType());
        dto.setCredit(entity.getCredit());
        dto.setDebit(entity.getDebit());
        dto.setBalance(entity.getBalance());
        dto.setReferenceNumber(entity.getReferenceNumber());
        dto.setMonth(entity.getMonth());
        dto.setYear(entity.getYear());
        dto.setSourceFile(entity.getSourceFile());
        dto.setImportedAt(entity.getImportedAt());
        dto.setIsMapped(entity.getIsMapped());
        dto.setMappedPaymentId(entity.getMappedPaymentId());
        dto.setMappedStudentId(entity.getMappedStudentId());
        dto.setMappedAt(entity.getMappedAt());
        dto.setMappedBy(entity.getMappedBy());
        return dto;
    }
}

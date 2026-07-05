package com.hostel.backend.mapper;

import com.hostel.backend.dto.ExpenseDTO;
import com.hostel.backend.entity.Expense;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseDTO toDto(Expense entity) {
        if (entity == null) {
            return null;
        }

        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(entity.getId());
        

        dto.setCategory(entity.getCategory());
        dto.setAmount(entity.getAmount());
        dto.setExpenseDate(entity.getExpenseDate());
        dto.setDescription(entity.getDescription());
        dto.setReceiptUrl(entity.getReceiptUrl());

        if (entity.getRecordedBy() != null) {
            dto.setRecordedBy(entity.getRecordedBy().getId());
        }

        return dto;
    }

    public Expense toEntity(ExpenseDTO dto) {
        if (dto == null) {
            return null;
        }

        Expense entity = new Expense();
        entity.setId(dto.getId());

        entity.setCategory(dto.getCategory());
        entity.setAmount(dto.getAmount());
        entity.setExpenseDate(dto.getExpenseDate());
        entity.setDescription(dto.getDescription());
        entity.setReceiptUrl(dto.getReceiptUrl());

        if (dto.getRecordedBy() != null) {
            User user = new User();
            user.setId(dto.getRecordedBy());
            entity.setRecordedBy(user);
        }

        return entity;
    }
}

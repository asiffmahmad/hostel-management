package com.hostel.backend.service;

import com.hostel.backend.dto.ExpenseDTO;
import com.hostel.backend.entity.Expense;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.User;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.ExpenseMapper;
import com.hostel.backend.repository.ExpenseRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;

    @Override
    public ExpenseDTO createExpense(ExpenseDTO expenseDTO) {
        Hostel hostel = hostelRepository.findById(expenseDTO.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found"));
        User user = userRepository.findById(expenseDTO.getRecordedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = expenseMapper.toEntity(expenseDTO);
        expense.setHostel(hostel);
        expense.setRecordedBy(user);

        Expense savedExpense = expenseRepository.save(expense);
        return expenseMapper.toDto(savedExpense);
    }

    @Override
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDTO) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (expenseDTO.getHostelId() != null && !existingExpense.getHostel().getId().equals(expenseDTO.getHostelId())) {
            Hostel hostel = hostelRepository.findById(expenseDTO.getHostelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hostel not found"));
            existingExpense.setHostel(hostel);
        }

        existingExpense.setCategory(expenseDTO.getCategory());
        existingExpense.setAmount(expenseDTO.getAmount());
        existingExpense.setExpenseDate(expenseDTO.getExpenseDate());
        existingExpense.setDescription(expenseDTO.getDescription());
        existingExpense.setReceiptUrl(expenseDTO.getReceiptUrl());

        Expense updatedExpense = expenseRepository.save(existingExpense);
        return expenseMapper.toDto(updatedExpense);
    }

    @Override
    public ExpenseDTO getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return expenseMapper.toDto(expense);
    }

    @Override
    public List<ExpenseDTO> getExpensesByHostelId(Long hostelId) {
        return expenseRepository.findByHostelId(hostelId).stream()
                .map(expenseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expense.setIsActive(false);
        expense.setIsDeleted(true);
        expenseRepository.save(expense);
    }
}

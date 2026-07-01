package com.hostel.backend.service.impl;

import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.dto.BankTransactionGridFilterDTO;
import com.hostel.backend.dto.BankTransactionSummaryDTO;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.BankTransactionMapper;
import com.hostel.backend.repository.BankTransactionRepository;
import com.hostel.backend.service.AuditLogService;
import com.hostel.backend.service.BankTransactionGridService;
import com.hostel.backend.specification.BankTransactionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankTransactionGridServiceImpl implements BankTransactionGridService {

    private final BankTransactionRepository bankTransactionRepository;
    private final BankTransactionMapper bankTransactionMapper;
    private final AuditLogService auditLogService;

    @Override
    public Page<BankTransactionDTO> getBankTransactions(BankTransactionGridFilterDTO filterDTO) {
        Specification<BankTransaction> spec = BankTransactionSpecification.withFilter(filterDTO)
                .and((root, query, cb) -> cb.equal(root.get("isDeleted"), false));

        Sort.Direction direction = filterDTO.getSortDir().equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(filterDTO.getPage(), filterDTO.getSize(), Sort.by(direction, filterDTO.getSortBy()));

        Page<BankTransaction> page = bankTransactionRepository.findAll(spec, pageable);
        return page.map(bankTransactionMapper::toDto);
    }

    @Override
    public BankTransactionDTO getBankTransactionById(Long id) {
        BankTransaction transaction = bankTransactionRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return bankTransactionMapper.toDto(transaction);
    }

    @Override
    public void deleteBankTransaction(Long id, String username) {
        BankTransaction transaction = bankTransactionRepository.findById(id)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getIsMapped() != null && transaction.getIsMapped()) {
            throw new IllegalArgumentException("Cannot delete a transaction that is already mapped to a payment.");
        }

        transaction.setIsDeleted(true);
        bankTransactionRepository.save(transaction);
        
        auditLogService.logAction("BankTransaction", transaction.getId(), "DELETE_BANK_TRANSACTION", username, "Deleted imported bank transaction UTR: " + transaction.getUtrNumber());
    }

    @Override
    public BankTransactionSummaryDTO getBankTransactionSummary(String month, String year) {
        Specification<BankTransaction> spec = (root, query, cb) -> cb.and(
                cb.equal(cb.upper(root.get("month")), month.toUpperCase()),
                cb.equal(root.get("year"), year),
                cb.equal(root.get("isDeleted"), false)
        );
        
        List<BankTransaction> transactions = bankTransactionRepository.findAll(spec);
        
        long total = transactions.size();
        long credits = transactions.stream().filter(t -> "CREDIT".equalsIgnoreCase(t.getTransactionType())).count();
        long debits = transactions.stream().filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType())).count();
        long mapped = transactions.stream().filter(t -> t.getIsMapped() != null && t.getIsMapped()).count();
        long unmapped = total - mapped;
        
        BigDecimal creditAmount = transactions.stream()
                .filter(t -> "CREDIT".equalsIgnoreCase(t.getTransactionType()))
                .map(BankTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal debitAmount = transactions.stream()
                .filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType()))
                .map(BankTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BankTransactionSummaryDTO.builder()
                .totalTransactions(total)
                .creditTransactions(credits)
                .debitTransactions(debits)
                .mappedTransactions(mapped)
                .unmappedTransactions(unmapped)
                .totalCreditAmount(creditAmount)
                .totalDebitAmount(debitAmount)
                .build();
    }

    @Override
    public List<BankTransactionDTO> getBankTransactionsForExport(BankTransactionGridFilterDTO filterDTO) {
        Specification<BankTransaction> spec = BankTransactionSpecification.withFilter(filterDTO)
                .and((root, query, cb) -> cb.equal(root.get("isDeleted"), false));
        Sort.Direction direction = filterDTO.getSortDir().equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        List<BankTransaction> transactions = bankTransactionRepository.findAll(spec, Sort.by(direction, filterDTO.getSortBy()));
        return transactions.stream().map(bankTransactionMapper::toDto).collect(Collectors.toList());
    }
}

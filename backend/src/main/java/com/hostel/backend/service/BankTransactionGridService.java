package com.hostel.backend.service;

import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.dto.BankTransactionGridFilterDTO;
import com.hostel.backend.dto.BankTransactionSummaryDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BankTransactionGridService {
    Page<BankTransactionDTO> getBankTransactions(BankTransactionGridFilterDTO filterDTO);
    BankTransactionDTO getBankTransactionById(Long id);
    void deleteBankTransaction(Long id, String username);
    BankTransactionSummaryDTO getBankTransactionSummary(String month, String year);
    List<BankTransactionDTO> getBankTransactionsForExport(BankTransactionGridFilterDTO filterDTO);
}

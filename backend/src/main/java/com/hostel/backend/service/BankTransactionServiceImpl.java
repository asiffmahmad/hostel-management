package com.hostel.backend.service;

import com.hostel.backend.dto.BankImportResultDTO;
import com.hostel.backend.dto.BankTransactionDTO;
import com.hostel.backend.dto.MapPaymentRequestDTO;
import com.hostel.backend.dto.PaymentDTO;
import com.hostel.backend.entity.AuditLog;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.BankTransactionMapper;
import com.hostel.backend.mapper.PaymentMapper;
import com.hostel.backend.parser.BankParserFactory;
import com.hostel.backend.parser.BankStatementParser;
import com.hostel.backend.parser.ParsedTransaction;
import com.hostel.backend.repository.AuditLogRepository;
import com.hostel.backend.repository.BankTransactionRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankTransactionServiceImpl implements BankTransactionService {

    private final BankTransactionRepository bankTxnRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final BankParserFactory parserFactory;
    private final BankTransactionMapper bankTxnMapper;
    private final PaymentMapper paymentMapper;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public BankImportResultDTO importStatement(MultipartFile file, String month, String year, String provider, String mode) {
        String monthUpper = month != null && !month.trim().isEmpty() ? month.toUpperCase() : "AUTO_DETECT";
        String safeYear = year != null && !year.trim().isEmpty() ? year : "AUTO_DETECT";

        // Step 1: Handle mode (REPLACE vs APPEND)
        if ("REPLACE".equalsIgnoreCase(mode)) {
            long existingCount = bankTxnRepository.countByMonthAndYearAndIsDeletedFalse(monthUpper, safeYear);
            if (existingCount > 0) {
                log.info("Replacing {} existing transactions for {}/{}", existingCount, monthUpper, safeYear);
                bankTxnRepository.softDeleteByMonthAndYear(monthUpper, safeYear);
            }
        } else {
            log.info("Appending transactions for {}/{}", monthUpper, safeYear);
        }

        // Step 2: Parse the uploaded file
        BankStatementParser parser = (provider != null && !provider.isEmpty()) 
                ? parserFactory.getParserByBank(provider)
                : parserFactory.getParser(file);
        String accountNumber;
        List<ParsedTransaction> allTransactions;

        try {
            accountNumber = parser.extractAccountNumber(file);
            allTransactions = parser.parseAll(file);
        } catch (Exception e) {
            log.error("Failed to parse bank statement: {}", e.getMessage(), e);
            return BankImportResultDTO.builder()
                    .month(monthUpper)
                    .year(safeYear)
                    .sourceFile(file.getOriginalFilename())
                    .message("Parse error: " + e.getMessage())
                    .errors(1)
                    .build();
        }

        // Step 3: Import only CREDIT transactions
        int totalRows = allTransactions.size();
        int creditsImported = 0;
        int debitsSkipped = 0;
        int duplicatesSkipped = 0;
        int errors = 0;
        List<BankTransaction> toSave = new ArrayList<>();

        for (ParsedTransaction txn : allTransactions) {
            try {
                if (!"CREDIT".equalsIgnoreCase(txn.getTransactionType())) {
                    debitsSkipped++;
                    continue;
                }

                // Check if UTR already exists (from a previous non-deleted import)
                if (txn.getUtrNumber() != null) {
                    java.util.Optional<BankTransaction> existingOpt = bankTxnRepository.findByUtrNumberAndIsDeletedFalse(txn.getUtrNumber());
                    if (existingOpt.isPresent()) {
                        BankTransaction existing = existingOpt.get();
                        existing.setBankName(txn.getBankName() != null ? txn.getBankName() : parser.getSupportedBank());
                        existing.setTransactionDate(txn.getTransactionDate());
                        if (txn.getTransactionDate() != null) {
                            existing.setMonth(txn.getTransactionDate().getMonth().name());
                            existing.setYear(String.valueOf(txn.getTransactionDate().getYear()));
                        }
                        existing.setValueDate(txn.getValueDate());
                        existing.setDescription(txn.getDescription());
                        existing.setAmount(txn.getAmount() != null ? txn.getAmount() : BigDecimal.ZERO);
                        existing.setCredit(txn.getCredit());
                        existing.setSourceFile(file.getOriginalFilename());
                        
                        toSave.add(existing);
                        creditsImported++;
                        continue;
                    }
                }

                String txnMonth = txn.getTransactionDate() != null ? txn.getTransactionDate().getMonth().name() : monthUpper;
                String txnYear = txn.getTransactionDate() != null ? String.valueOf(txn.getTransactionDate().getYear()) : safeYear;

                BankTransaction entity = BankTransaction.builder()
                        .bankName(txn.getBankName() != null ? txn.getBankName() : parser.getSupportedBank())
                        .accountNumber(accountNumber != null ? accountNumber : "")
                        .transactionDate(txn.getTransactionDate())
                        .valueDate(txn.getValueDate())
                        .description(txn.getDescription())
                        .utrNumber(txn.getUtrNumber())
                        .amount(txn.getAmount() != null ? txn.getAmount() : BigDecimal.ZERO)
                        .transactionType("CREDIT")
                        .credit(txn.getCredit())
                        .debit(null)
                        .balance(txn.getBalance())
                        .referenceNumber(txn.getReferenceNumber())
                        .month(txnMonth)
                        .year(txnYear)
                        .sourceFile(file.getOriginalFilename())
                        .importedAt(LocalDateTime.now())
                        .isMapped(false)
                        .isActive(true)
                        .isDeleted(false)
                        .build();

                toSave.add(entity);
                creditsImported++;

            } catch (Exception e) {
                log.warn("Error processing transaction row: {}", e.getMessage());
                errors++;
            }
        }

        bankTxnRepository.saveAll(toSave);

        // Audit log
        saveAudit("BankStatement", null, "IMPORT",
                "Imported " + creditsImported + " credit transactions for " + monthUpper + "/" + safeYear,
                file.getOriginalFilename());

        return BankImportResultDTO.builder()
                .month(monthUpper)
                .year(safeYear)
                .bankName(parser.getSupportedBank())
                .accountNumber(accountNumber)
                .sourceFile(file.getOriginalFilename())
                .totalRowsRead(totalRows)
                .creditsImported(creditsImported)
                .debitsSkipped(debitsSkipped)
                .duplicatesSkipped(duplicatesSkipped)
                .errors(errors)
                .message("Import completed successfully")
                .build();
    }

    @Override
    public List<BankTransactionDTO> search(String utrNumber, BigDecimal amount, LocalDate txnDate, String reference) {
        return bankTxnRepository.search(utrNumber, amount, txnDate, reference)
                .stream()
                .map(bankTxnMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BankTransactionDTO> getByMonth(String month, String year) {
        return bankTxnRepository.findByMonthAndYearAndIsDeletedFalse(month.toUpperCase(), year)
                .stream()
                .map(bankTxnMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentDTO mapToPayment(MapPaymentRequestDTO request) {
        // Fetch transaction
        BankTransaction txn = bankTxnRepository.findById(request.getBankTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Bank transaction not found: " + request.getBankTransactionId()));

        // Validations
        if (txn.getIsMapped()) {
            throw new IllegalStateException("This transaction has already been mapped to a payment.");
        }
        if (!"CREDIT".equalsIgnoreCase(txn.getTransactionType())) {
            throw new IllegalStateException("Cannot map a DEBIT transaction to a payment.");
        }

        // Fetch student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));

        if (student.getIsDeleted() || !"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new IllegalStateException("Cannot map payment to an inactive student.");
        }

        // Validate UTR not already used in payments
        if (txn.getUtrNumber() != null && paymentRepository.existsByUtrNumber(txn.getUtrNumber())) {
            throw new IllegalStateException("UTR " + txn.getUtrNumber() + " is already recorded in payment history.");
        }

        String month = request.getMonth() != null ? request.getMonth().toUpperCase() : txn.getMonth();
        String year  = request.getYear()  != null ? request.getYear()  : txn.getYear();

        // Find or create payment record
        Payment payment;
        if (request.getExistingPaymentId() != null) {
            payment = paymentRepository.findById(request.getExistingPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + request.getExistingPaymentId()));
            if ("PAID".equalsIgnoreCase(payment.getStatus())) {
                throw new IllegalStateException("This payment is already marked as PAID.");
            }
        } else {
            payment = new Payment();
            payment.setStudent(student);
            payment.setMonth(month);
            payment.setYear(year);
            payment.setDueDate(LocalDate.now());
            payment.setExpectedAmount(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
            payment.setAmount(0.0);
        }

        // Update payment with bank details
        double newAmountPaid = (payment.getAmount() != null ? payment.getAmount() : 0.0) + txn.getAmount().doubleValue();
        payment.setAmount(newAmountPaid);
        
        double expected = payment.getExpectedAmount() != null ? payment.getExpectedAmount() : 0.0;
        double due = Math.max(0.0, expected - newAmountPaid);
        payment.setDueAmount(due);

        if (due > 0) {
            payment.setStatus("PENDING DUE");
        } else {
            payment.setStatus("PAID");
        }

        payment.setUtrNumber(txn.getUtrNumber()); // We keep the latest UTR directly on Payment record
        payment.setBankTransactionId(txn.getId());
        payment.setPaymentSource("BANK_IMPORT");
        payment.setBankName(txn.getBankName());
        payment.setImportedDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Mark transaction as mapped
        txn.setIsMapped(true);
        txn.setMappedPaymentId(saved.getId());
        txn.setMappedStudentId(student.getId());
        txn.setMappedAt(LocalDateTime.now());
        txn.setMappedBy(request.getMappedBy());
        bankTxnRepository.save(txn);

        // Audit log
        saveAudit("Payment", saved.getId(), "BANK_MAP",
                "Payment mapped from bank UTR: " + txn.getUtrNumber() + " for student: " + student.getName(),
                request.getMappedBy());

        return paymentMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void unmapPayment(Long bankTransactionId, String username) {
        BankTransaction txn = bankTxnRepository.findById(bankTransactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank transaction not found: " + bankTransactionId));

        if (!txn.getIsMapped()) {
            throw new IllegalStateException("Transaction is not currently mapped.");
        }

        Long paymentId = txn.getMappedPaymentId();
        if (paymentId != null) {
            paymentRepository.findById(paymentId).ifPresent(payment -> {
                double newAmountPaid = (payment.getAmount() != null ? payment.getAmount() : 0.0) - txn.getAmount().doubleValue();
                if (newAmountPaid < 0) newAmountPaid = 0.0;
                payment.setAmount(newAmountPaid);
                
                double expected = payment.getExpectedAmount() != null ? payment.getExpectedAmount() : 0.0;
                double due = Math.max(0.0, expected - newAmountPaid);
                payment.setDueAmount(due);

                if (newAmountPaid == 0.0) {
                    payment.setStatus("PENDING");
                    payment.setUtrNumber(null);
                    payment.setBankTransactionId(null);
                    payment.setPaymentSource("MANUAL");
                    payment.setBankName(null);
                    payment.setImportedDate(null);
                } else {
                    if (due > 0) {
                        payment.setStatus("PENDING DUE");
                    } else {
                        payment.setStatus("PAID");
                    }
                    // Since it has partial amount paid by OTHER transactions, we might want to keep the UTR/bank info of the other one.
                    // But for simplicity, we don't fetch the previous one. The payment source remains "BANK_IMPORT" if there's money.
                }
                
                paymentRepository.save(payment);
                
                saveAudit("Payment", payment.getId(), "BANK_UNMAP",
                        "Payment unmapped from bank UTR: " + txn.getUtrNumber(),
                        username);
            });
        }

        txn.setIsMapped(false);
        txn.setMappedPaymentId(null);
        txn.setMappedStudentId(null);
        txn.setMappedBy(null);
        txn.setMappedAt(null);
        bankTxnRepository.save(txn);
    }

    @Override
    @Transactional
    public void deleteByMonth(String month, String year) {
        bankTxnRepository.softDeleteByMonthAndYear(month.toUpperCase(), year);
        saveAudit("BankStatement", null, "DELETE",
                "Deleted transactions for " + month.toUpperCase() + "/" + year, "system");
    }

    @Override
    public BankTransactionDTO getById(Long id) {
        return bankTxnRepository.findById(id)
                .map(bankTxnMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Bank transaction not found: " + id));
    }

    private void saveAudit(String entity, Long entityId, String action, String newValues, String username) {
        try {
            AuditLog log = AuditLog.builder()
                    .entityName(entity)
                    .entityId(entityId != null ? entityId : 0L)
                    .action(action)
                    .newValues(newValues)
                    .username(username != null ? username : "system")
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Non-critical — don't fail the main operation
        }
    }
}

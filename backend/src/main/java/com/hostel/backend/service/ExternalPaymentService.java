package com.hostel.backend.service;

import com.hostel.backend.dto.ExternalPaymentDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.entity.ExternalPayment;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.repository.BankTransactionRepository;
import com.hostel.backend.repository.ExternalPaymentRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalPaymentService {

    private final ExternalPaymentRepository externalPaymentRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<ExternalPaymentDTO> getAllPendingExternalPayments() {
        return externalPaymentRepository.findByValidationStatusAndIsDeletedFalse("PENDING").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ExternalPaymentDTO> getAllExternalPayments(String month, String year) {
        List<ExternalPayment> payments;
        boolean hasMonth = month != null && !month.isBlank() && !month.equalsIgnoreCase("ALL");
        boolean hasYear = year != null && !year.isBlank() && !year.equalsIgnoreCase("ALL");

        if (hasMonth && hasYear) {
            payments = externalPaymentRepository.findByMonthIgnoreCaseAndYearAndIsDeletedFalse(month, year);
        } else {
            payments = externalPaymentRepository.findByIsDeletedFalse();
        }
        return payments.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ExternalPaymentDTO mapToDTO(ExternalPayment ep) {
        Student student = ep.getStudent();
        ExternalPaymentDTO dto = ExternalPaymentDTO.builder()
                .id(ep.getId())
                .studentId(student.getId())
                .studentName(student.getName())
                .phone(student.getPhone())
                .month(ep.getMonth())
                .year(ep.getYear())
                .utrNumber(ep.getUtrNumber())
                .amount(ep.getAmount())
                .transactionDate(ep.getTransactionDate())
                .validationStatus(ep.getValidationStatus())
                .failureReason(ep.getFailureReason())
                .build();

        if (student.getBed() != null && student.getBed().getRoom() != null && student.getBed().getRoom().getHostel() != null) {
            dto.setHostelName(student.getBed().getRoom().getHostel().getName());
        }

        // Calculate Monthly payment status
        List<Payment> payments = paymentRepository.findByStudentId(student.getId());
        Optional<Payment> monthlyPayment = payments.stream()
                .filter(p -> p.getMonth().equalsIgnoreCase(ep.getMonth()) && p.getYear().equals(ep.getYear()))
                .findFirst();

        if (monthlyPayment.isPresent()) {
            Payment p = monthlyPayment.get();
            dto.setTotalMonthDue(p.getExpectedAmount());
            dto.setTotalMonthPaid(p.getAmount());
            dto.setPaymentStatus(p.getStatus());
        } else {
            dto.setTotalMonthDue(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
            dto.setTotalMonthPaid(0.0);
            dto.setPaymentStatus("PENDING");
        }

        return dto;
    }

    @Transactional
    public MessageResponse validateAllPending() {
        List<ExternalPayment> pendingPayments = externalPaymentRepository.findByValidationStatusAndIsDeletedFalse("PENDING");
        int validatedCount = 0;
        int failedCount = 0;

        for (ExternalPayment ep : pendingPayments) {
            try {
                boolean isValidated = validateSingleExternalPayment(ep);
                if (isValidated) {
                    validatedCount++;
                } else {
                    failedCount++;
                }
            } catch (Exception e) {
                log.error("Failed to validate external payment ID: " + ep.getId(), e);
                failedCount++;
            }
        }

        return new MessageResponse("Bulk validation completed. Validated: " + validatedCount + ", Failed/Pending: " + failedCount);
    }

    @Transactional
    public MessageResponse validateExternalPayment(Long id) {
        ExternalPayment ep = externalPaymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("External Payment not found"));

        if (!"PENDING".equals(ep.getValidationStatus())) {
            throw new IllegalArgumentException("Payment is already " + ep.getValidationStatus());
        }

        boolean success = validateSingleExternalPayment(ep);
        if (success) {
            return new MessageResponse("Payment validated successfully");
        } else {
            return new MessageResponse("Payment validation failed: " + ep.getFailureReason());
        }
    }

    private boolean validateSingleExternalPayment(ExternalPayment ep) {
        // Find matching BankTransaction
        Optional<BankTransaction> bankTxnOpt = bankTransactionRepository.findByUtrNumberAndIsDeletedFalse(ep.getUtrNumber());
        if (bankTxnOpt.isEmpty()) {
            ep.setFailureReason("UTR not found in bank records.");
            ep.setValidationStatus("FAILED");
            externalPaymentRepository.save(ep);
            return false;
        }

        BankTransaction bankTxn = bankTxnOpt.get();
        if (bankTxn.getIsMapped()) {
            ep.setFailureReason("UTR already mapped to another payment.");
            ep.setValidationStatus("FAILED");
            externalPaymentRepository.save(ep);
            return false;
        }

        // Apply Payment Logic
        Student student = ep.getStudent();
        List<Payment> existingPayments = paymentRepository.findByStudentId(student.getId());
        Optional<Payment> monthlyPaymentOpt = existingPayments.stream()
                .filter(p -> p.getMonth().equalsIgnoreCase(ep.getMonth()) && p.getYear().equals(ep.getYear()))
                .findFirst();

        Payment payment;
        if (monthlyPaymentOpt.isPresent()) {
            payment = monthlyPaymentOpt.get();
        } else {
            payment = new Payment();
            payment.setStudent(student);
            payment.setMonth(ep.getMonth().toUpperCase());
            payment.setYear(ep.getYear());
            payment.setExpectedAmount(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
            payment.setAmount(0.0);
        }

        // We update the cumulative amount
        double newTotalPaid = payment.getAmount() + bankTxn.getAmount().doubleValue();
        payment.setAmount(newTotalPaid);
        payment.setUtrNumber(ep.getUtrNumber()); // Last UTR mapped for reference
        
        if (payment.getExpectedAmount() != null) {
            double newDue = Math.max(0, payment.getExpectedAmount() - payment.getAmount());
            payment.setDueAmount(newDue);
            
            if (payment.getAmount() >= payment.getExpectedAmount()) {
                payment.setStatus("PAID");
            } else if (payment.getAmount() > 0) {
                payment.setStatus("PARTIALLY_PAID");
            } else {
                payment.setStatus("PENDING");
            }
        }
        
        payment.setPaymentSource("PUBLIC_FORM");
        payment = paymentRepository.save(payment);

        // Update External Payment
        ep.setValidationStatus("VALIDATED");
        ep.setLinkedPayment(payment);
        ep.setAmount(bankTxn.getAmount().doubleValue()); // Ensure it matches bank strictly
        ep.setFailureReason(null);
        externalPaymentRepository.save(ep);

        // Update Bank Transaction
        bankTxn.setIsMapped(true);
        bankTxn.setMappedStudentId(student.getId());
        bankTxn.setMappedPaymentId(payment.getId());
        bankTxn.setMappedAt(LocalDateTime.now());
        bankTxn.setMappedBy("SYSTEM_AUTO_VALIDATION");
        bankTransactionRepository.save(bankTxn);

        return true;
    }
}

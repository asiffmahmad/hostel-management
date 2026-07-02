package com.hostel.backend.service;

import com.hostel.backend.dto.PaymentDTO;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.PaymentMapper;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        // Validate UTR uniqueness (only if provided)
        if (paymentDTO.getUtrNumber() != null && !paymentDTO.getUtrNumber().isBlank()) {
            if (paymentRepository.existsByUtrNumber(paymentDTO.getUtrNumber())) {
                throw new IllegalArgumentException("UTR Number already exists: " + paymentDTO.getUtrNumber());
            }
        }

        Student student = studentRepository.findById(paymentDTO.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + paymentDTO.getStudentId()));

        Payment payment = paymentMapper.toEntity(paymentDTO);
        payment.setStudent(student);

        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toDto(savedPayment);
    }

    @Override
    public PaymentDTO updatePayment(Long id, PaymentDTO paymentDTO) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        // Validate UTR uniqueness on update (exclude self)
        if (paymentDTO.getUtrNumber() != null && !paymentDTO.getUtrNumber().isBlank()) {
            if (paymentRepository.existsByUtrNumberAndIdNot(paymentDTO.getUtrNumber(), id)) {
                throw new IllegalArgumentException("UTR Number already used by another payment: " + paymentDTO.getUtrNumber());
            }
        }

        if (paymentDTO.getStudentId() != null && !existingPayment.getStudent().getId().equals(paymentDTO.getStudentId())) {
            Student student = studentRepository.findById(paymentDTO.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            existingPayment.setStudent(student);
        }

        existingPayment.setAmount(paymentDTO.getAmount());
        existingPayment.setMonth(paymentDTO.getMonth());
        existingPayment.setYear(paymentDTO.getYear());
        existingPayment.setStatus(paymentDTO.getStatus());
        existingPayment.setDueDate(paymentDTO.getDueDate());

        // Update UTR / Bank fields if provided
        if (paymentDTO.getUtrNumber() != null) existingPayment.setUtrNumber(paymentDTO.getUtrNumber());
        if (paymentDTO.getBankName() != null) existingPayment.setBankName(paymentDTO.getBankName());
        if (paymentDTO.getPaymentSource() != null) existingPayment.setPaymentSource(paymentDTO.getPaymentSource());
        if (paymentDTO.getBankTransactionId() != null) existingPayment.setBankTransactionId(paymentDTO.getBankTransactionId());
        if (paymentDTO.getImportedDate() != null) existingPayment.setImportedDate(paymentDTO.getImportedDate());

        Payment updatedPayment = paymentRepository.save(existingPayment);
        return paymentMapper.toDto(updatedPayment);
    }

    @Override
    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return paymentMapper.toDto(payment);
    }

    @Override
    public List<PaymentDTO> getPaymentsByStudentId(Long studentId) {
        return paymentRepository.findByStudentId(studentId).stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentDTO> getAllPayments(Long hostelId) {
        if (hostelId != null) {
            return paymentRepository.findByStudentBedRoomHostelIdOrderByCreatedAtDesc(hostelId).stream()
                    .map(paymentMapper::toDto)
                    .collect(Collectors.toList());
        }
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setIsActive(false);
        payment.setIsDeleted(true);
        paymentRepository.save(payment);
    }

    @Override
    public Optional<PaymentDTO> searchByUtr(String utrNumber) {
        return paymentRepository.findByUtrNumber(utrNumber)
                .map(paymentMapper::toDto);
    }

    @Override
    public void generateMonthlyInvoices(String month, String year) {
        java.time.LocalDate now = java.time.LocalDate.now();
        String currentMonth = (month != null && !month.isBlank()) ? month.toUpperCase() : now.getMonth().name();
        String currentYear = (year != null && !year.isBlank()) ? year : String.valueOf(now.getYear());

        List<Student> activeStudents = studentRepository.findAll().stream()
            .filter(s -> !s.getIsDeleted() && "ACTIVE".equals(s.getStatus()))
            .collect(Collectors.toList());

        for (Student student : activeStudents) {
            boolean exists = paymentRepository.findByStudentId(student.getId()).stream()
                .anyMatch(p -> currentMonth.equalsIgnoreCase(p.getMonth()) && currentYear.equals(p.getYear()));

            if (!exists) {
                Payment payment = new Payment();
                payment.setStudent(student);
                payment.setMonth(currentMonth);
                payment.setYear(currentYear);
                payment.setAmount(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
                payment.setStatus("PENDING");
                // Due date can be set based on the selected year and month if valid, but keeping default logic for simplicity
                int dueYear = Integer.parseInt(currentYear);
                int monthVal = 1;
                try {
                    monthVal = java.time.Month.valueOf(currentMonth).getValue();
                } catch (Exception e) {}
                payment.setDueDate(java.time.LocalDate.of(dueYear, monthVal, 5));
                payment.setPaymentSource("MANUAL");
                paymentRepository.save(payment);
            }
        }
    }
}

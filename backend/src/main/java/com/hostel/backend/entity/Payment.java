package com.hostel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_payments", indexes = {
    @Index(name = "idx_payment_status", columnList = "status"),
    @Index(name = "idx_payment_student_id", columnList = "student_id"),
    @Index(name = "idx_payment_month_year", columnList = "month, year")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private String year;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "due_date")
    private LocalDate dueDate;

    // ── UTR / Bank import fields (all nullable – backward-compatible) ──

    @Column(name = "utr_number", unique = true)
    private String utrNumber;

    @Column(name = "bank_transaction_id")
    private Long bankTransactionId;

    @Column(name = "payment_source", length = 50)
    @Builder.Default
    private String paymentSource = "MANUAL";

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "imported_date")
    private LocalDateTime importedDate;
}


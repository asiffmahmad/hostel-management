package com.hostel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "hostel_external_payment", indexes = {
    @Index(name = "idx_external_payment_status", columnList = "validation_status"),
    @Index(name = "idx_external_payment_student_id", columnList = "student_id"),
    @Index(name = "idx_external_payment_month_year", columnList = "month, year")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class ExternalPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private String year;

    @Column(name = "utr_number", nullable = false)
    private String utrNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    // PENDING, VALIDATED, FAILED, REJECTED
    @Column(name = "validation_status", nullable = false)
    @Builder.Default
    private String validationStatus = "PENDING";

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    // Once validated, link it to the Monthly Payment record
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_payment_id")
    private Payment linkedPayment;
}

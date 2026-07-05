package com.hostel.backend.entity;

import com.hostel.backend.enums.AdmissionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_admission_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAdmissionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String parentPhone;
    private String fatherName;
    private String aadhaarNumber;
    private String address;

    @Column(name = "hostel_code", nullable = false)
    private String hostelCode; // FK to Hostel (code)

    @Column(name = "room_number", nullable = false)
    private String roomNumber; // FK to Room (number)

    @Column(name = "bed_name", nullable = false)
    private String bedName; // FK to Bed (name)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AdmissionStatus status = AdmissionStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

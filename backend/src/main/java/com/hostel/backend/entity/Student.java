package com.hostel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "hostel_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Student extends BaseEntity {

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column
    private String photo;

    @Transient
    private String phone;

    @Column(name = "phone_encrypted")
    private String phoneEncrypted;

    @Column(name = "phone_hash")
    private String phoneHash;

    @Transient
    private String parentPhone;

    @Column(name = "parent_phone_encrypted")
    private String parentPhoneEncrypted;

    @Column(name = "parent_phone_hash")
    private String parentPhoneHash;

    @Column(name = "father_name")
    private String fatherName;

    @Transient
    private String fatherPhone;

    @Column(name = "father_phone_encrypted")
    private String fatherPhoneEncrypted;

    @Column(name = "father_phone_hash")
    private String fatherPhoneHash;

    @Column(name = "mother_name")
    private String motherName;

    @Transient
    private String motherPhone;

    @Column(name = "mother_phone_encrypted")
    private String motherPhoneEncrypted;

    @Column(name = "mother_phone_hash")
    private String motherPhoneHash;

    @Column(name = "guardian_relation")
    private String guardianRelation;

    @Column(name = "guardian_name")
    private String guardianName;

    @Transient
    private String guardianPhone;

    @Column(name = "guardian_phone_encrypted")
    private String guardianPhoneEncrypted;

    @Column(name = "guardian_phone_hash")
    private String guardianPhoneHash;

    @Transient
    private String email;

    @Column(name = "email_encrypted")
    private String emailEncrypted;

    @Column(name = "email_hash")
    private String emailHash;

    @Transient
    private String address;

    @Column(name = "address_encrypted", columnDefinition = "TEXT")
    private String addressEncrypted;

    @Transient
    private String aadhaarNumber;

    @Column(name = "aadhaar_number_encrypted")
    private String aadhaarNumberEncrypted;

    @Column(name = "aadhaar_number_hash")
    private String aadhaarNumberHash;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id")
    private Bed bed;

    @Column(name = "monthly_rent", nullable = false)
    @Builder.Default
    private Double monthlyRent = 0.0;

    @Column(name = "advance_deposit", nullable = false)
    @Builder.Default
    private Double advanceDeposit = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @PrePersist
    @PreUpdate
    public void secureData() {
        if (this.phone != null) {
            this.phoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.phone);
            this.phoneHash = com.hostel.backend.security.EncryptionContext.hash(this.phone);
        }
        if (this.parentPhone != null) {
            this.parentPhoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.parentPhone);
            this.parentPhoneHash = com.hostel.backend.security.EncryptionContext.hash(this.parentPhone);
        }
        if (this.fatherPhone != null) {
            this.fatherPhoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.fatherPhone);
            this.fatherPhoneHash = com.hostel.backend.security.EncryptionContext.hash(this.fatherPhone);
        }
        if (this.motherPhone != null) {
            this.motherPhoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.motherPhone);
            this.motherPhoneHash = com.hostel.backend.security.EncryptionContext.hash(this.motherPhone);
        }
        if (this.guardianPhone != null) {
            this.guardianPhoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.guardianPhone);
            this.guardianPhoneHash = com.hostel.backend.security.EncryptionContext.hash(this.guardianPhone);
        }
        if (this.email != null) {
            this.emailEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.email);
            this.emailHash = com.hostel.backend.security.EncryptionContext.hash(this.email);
        }
        if (this.address != null) {
            this.addressEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.address);
        }
        if (this.aadhaarNumber != null) {
            this.aadhaarNumberEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.aadhaarNumber);
            this.aadhaarNumberHash = com.hostel.backend.security.EncryptionContext.hash(this.aadhaarNumber);
        }
    }

    @PostLoad
    public void loadSecureData() {
        if (this.phoneEncrypted != null) {
            this.phone = com.hostel.backend.security.EncryptionContext.decrypt(this.phoneEncrypted);
        }
        if (this.parentPhoneEncrypted != null) {
            this.parentPhone = com.hostel.backend.security.EncryptionContext.decrypt(this.parentPhoneEncrypted);
        }
        if (this.fatherPhoneEncrypted != null) {
            this.fatherPhone = com.hostel.backend.security.EncryptionContext.decrypt(this.fatherPhoneEncrypted);
        }
        if (this.motherPhoneEncrypted != null) {
            this.motherPhone = com.hostel.backend.security.EncryptionContext.decrypt(this.motherPhoneEncrypted);
        }
        if (this.guardianPhoneEncrypted != null) {
            this.guardianPhone = com.hostel.backend.security.EncryptionContext.decrypt(this.guardianPhoneEncrypted);
        }
        if (this.emailEncrypted != null) {
            this.email = com.hostel.backend.security.EncryptionContext.decrypt(this.emailEncrypted);
        }
        if (this.addressEncrypted != null) {
            this.address = com.hostel.backend.security.EncryptionContext.decrypt(this.addressEncrypted);
        }
        if (this.aadhaarNumberEncrypted != null) {
            this.aadhaarNumber = com.hostel.backend.security.EncryptionContext.decrypt(this.aadhaarNumberEncrypted);
        }
    }
}

package com.hostel.backend.dto;

import com.hostel.backend.enums.AdmissionStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdmissionRequestResponseDTO {
    private Long id;
    private String studentName;
    private String email;
    private String phone;
    private String parentPhone;
    private String fatherName;
    private String aadhaarNumber;
    private String address;
    private String hostelCode;
    private String roomNumber;
    private String bedName;
    private AdmissionStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

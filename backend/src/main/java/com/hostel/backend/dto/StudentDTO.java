package com.hostel.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentDTO {
    private Long id;

    @NotBlank
    private String studentId;

    @NotBlank
    private String name;

    private String photo;
    
    @NotBlank
    private String phone;
    
    private String parentPhone;
    
    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    private String guardianRelation;
    private String guardianName;
    private String guardianPhone;
    private String notes;
    
    @Email
    private String email;
    
    private String address;
    private LocalDate joiningDate;
    private Long bedId;
    private Long roomId;
    private Long hostelId;
    
    @NotNull
    private Double monthlyRent;
    
    @NotNull
    private Double advanceDeposit;
    
    private String status;
}

package com.hostel.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdmissionRequestCreateDTO {

    @NotBlank(message = "Student Name is required")
    private String studentName;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone Number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Parent Phone Number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Parent Phone number must be exactly 10 digits")
    private String parentPhone;

    @NotBlank(message = "Father's Name is required")
    private String fatherName;

    @NotBlank(message = "Aadhaar Number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar must be exactly 12 digits")
    private String aadhaarNumber;

    @NotBlank(message = "Full Address is required")
    private String address;

    @NotBlank(message = "Hostel selection is required")
    private String hostelCode;

    @NotBlank(message = "Room selection is required")
    private String roomNumber;

    private String bedName;

    // Optional reCAPTCHA token
    private String recaptchaToken;
}

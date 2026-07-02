package com.hostel.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PublicRegistrationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phone;

    private String parentPhone;
    private String fatherName;
    private String aadhaarNumber;

    @NotBlank(message = "Address is required")
    private String address;

    // Hardcoded selections from frontend
    @NotBlank(message = "Hostel selection is required")
    private String hostelCode;

    @NotBlank(message = "Room selection is required")
    private String roomNumber;

    @NotBlank(message = "Bed selection is required")
    private String bedName;
}

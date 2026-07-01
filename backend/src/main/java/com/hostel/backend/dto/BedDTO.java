package com.hostel.backend.dto;

import com.hostel.backend.enums.BedStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BedDTO {
    private Long id;

    @NotBlank
    private String bedNumber;
    
    private String bedName;

    private BedStatus status;
    private Long roomId;
    private Long studentId;
    
    // UI field
    private String studentName;
}

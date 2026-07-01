package com.hostel.backend.dto;

import com.hostel.backend.enums.HostelStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HostelDTO {
    private Long id;

    @NotBlank
    private String name;
    
    private String hostelCode;
    private String address;
    private String description;
    private String hostelType;
    private Integer totalFloors;
    private String notes;

    // Computed fields
    private Integer totalBeds;
    private Integer occupiedBeds;
    private Integer vacantBeds;
    private Double currentCollection;
    private Double pendingCollection;
    
    private Double baseRent;
    
    private HostelStatus status;
}

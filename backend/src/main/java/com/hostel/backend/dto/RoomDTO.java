package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomDTO {
    private Long id;

    @NotNull
    private Long hostelId;

    @NotBlank
    private String roomNumber;
    
    private String roomName;
    private String floor;

    @NotNull
    private Integer capacity;

    private String type;
    private String description;
    private String status;
    
    // Computed fields for UI
    private Integer occupiedBeds;
    private Integer vacantBeds;
    
    private Double baseRent;
}

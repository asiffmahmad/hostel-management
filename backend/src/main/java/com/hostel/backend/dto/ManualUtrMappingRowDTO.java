package com.hostel.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManualUtrMappingRowDTO {
    private String studentName;
    private String month;
    private String year;
    private String utrNumber;
    private boolean success;
    private String reason;
}

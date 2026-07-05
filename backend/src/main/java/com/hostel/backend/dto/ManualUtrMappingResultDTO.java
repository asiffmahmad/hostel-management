package com.hostel.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ManualUtrMappingResultDTO {
    private int totalRows;
    private int successfulRows;
    private int failedRows;
    private List<ManualUtrMappingRowDTO> details;
}

package com.hostel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyFinancialData {
    private String monthYear; // e.g., "Jul 2026"
    private Double revenue;
    private Double expenses;
    private Double profit;
}

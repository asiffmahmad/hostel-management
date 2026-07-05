package com.hostel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReportDTO {
    private Double totalRevenue;       // same as collectedRevenue (kept for backward compat)
    private Double expectedRevenue;    // sum of all active students' monthly rent
    private Double collectedRevenue;   // actual PAID payments for the period
    private Double totalExpenses;
    private Double netProfit;          // collectedRevenue - totalExpenses
    private List<MonthlyFinancialData> monthlyData;
}

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
    private Double totalRevenue;
    private Double totalExpenses;
    private Double netProfit;
    private List<MonthlyFinancialData> monthlyData;
}

package com.hostel.backend.service;

import com.hostel.backend.dto.DashboardStatsDTO;
import com.hostel.backend.dto.FinancialReportDTO;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(Long hostelId);
    FinancialReportDTO getFinancialReport(int months, Long hostelId);
}

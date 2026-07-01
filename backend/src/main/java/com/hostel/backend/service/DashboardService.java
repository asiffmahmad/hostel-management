package com.hostel.backend.service;

import com.hostel.backend.dto.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(Long hostelId);
}

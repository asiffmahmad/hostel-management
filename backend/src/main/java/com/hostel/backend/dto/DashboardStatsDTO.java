package com.hostel.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalHostels;
    private long totalStudents;
    private long occupiedStudents;
    private long totalBeds;
    private long occupiedBeds;
    private long vacantBeds;
    private double occupancyRate;
    private double monthlyRevenue;
    
    private List<Map<String, Object>> revenueData;
    private List<Map<String, Object>> occupancyData;
    private List<Map<String, Object>> recentAdmissions;
    private List<Map<String, Object>> recentActivities;
}

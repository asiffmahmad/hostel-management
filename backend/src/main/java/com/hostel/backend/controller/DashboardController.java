package com.hostel.backend.controller;

import com.hostel.backend.dto.DashboardStatsDTO;
import com.hostel.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getStats(@org.springframework.web.bind.annotation.RequestParam(required = false) Long hostelId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(hostelId));
    }

    @GetMapping("/financial")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<com.hostel.backend.dto.FinancialReportDTO> getFinancialReport(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "6") int months,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long hostelId) {
        return ResponseEntity.ok(dashboardService.getFinancialReport(months, hostelId));
    }
}

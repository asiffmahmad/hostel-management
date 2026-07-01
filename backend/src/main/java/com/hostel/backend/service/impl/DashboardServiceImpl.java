package com.hostel.backend.service.impl;

import com.hostel.backend.dto.DashboardStatsDTO;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final HostelRepository hostelRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final BedRepository bedRepository;

    @Override
    public DashboardStatsDTO getDashboardStats(Long hostelId) {
        long totalHostels = hostelId != null ? 1 : hostelRepository.count();
        
        List<com.hostel.backend.entity.Student> students = hostelId != null 
                ? studentRepository.findByIsDeletedFalse().stream().filter(s -> s.getBed() != null && s.getBed().getRoom().getHostel().getId().equals(hostelId)).collect(java.util.stream.Collectors.toList())
                : studentRepository.findByIsDeletedFalse();
                
        long totalStudents = students.size();
        long occupiedStudents = students.stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()) && s.getBed() != null)
                .count();
        
        // Calculate overall occupancy dynamically
        List<com.hostel.backend.entity.Bed> beds = hostelId != null
                ? bedRepository.findAll().stream().filter(b -> b.getRoom().getHostel().getId().equals(hostelId)).collect(java.util.stream.Collectors.toList())
                : bedRepository.findAll();
                
        long totalBeds = beds.size();
        long occupiedBeds = beds.stream()
                            .filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();
        
        double occupancyRate = 0;
        if (totalBeds > 0) {
            occupancyRate = (double) occupiedBeds / totalBeds * 100;
        }

        List<com.hostel.backend.entity.Payment> payments = hostelId != null
                ? paymentRepository.findAll().stream().filter(p -> p.getStudent().getBed() != null && p.getStudent().getBed().getRoom().getHostel().getId().equals(hostelId)).collect(java.util.stream.Collectors.toList())
                : paymentRepository.findAll();

        double monthlyRevenue = payments.stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .mapToDouble(com.hostel.backend.entity.Payment::getAmount)
                .sum();

        // Dynamic Revenue Data
        List<Map<String, Object>> revenueData = new ArrayList<>();
        payments.stream()
            .filter(p -> "PAID".equals(p.getStatus()))
            .forEach(p -> {
                String monthKey = p.getMonth() + " " + p.getYear();
                Map<String, Object> map = revenueData.stream()
                        .filter(m -> m.get("name").equals(monthKey))
                        .findFirst()
                        .orElseGet(() -> {
                            Map<String, Object> newMap = new HashMap<>();
                            newMap.put("name", monthKey);
                            newMap.put("total", 0.0);
                            revenueData.add(newMap);
                            return newMap;
                        });
                map.put("total", (Double) map.get("total") + p.getAmount());
            });

        // Occupancy Data Dynamic
        List<Map<String, Object>> occupancyData = new ArrayList<>();
        List<Hostel> hostels = hostelId != null 
                ? hostelRepository.findById(hostelId).map(java.util.Collections::singletonList).orElse(new ArrayList<>())
                : hostelRepository.findAll();
        for (Hostel h : hostels) {
            Map<String, Object> map = new HashMap<>();
            int hTotalBeds = bedRepository.countBedsByHostelId(h.getId());
            int hOccupiedBeds = bedRepository.countBedsByHostelIdAndStatus(h.getId(), BedStatus.OCCUPIED);
            map.put("name", h.getName());
            map.put("occupied", hOccupiedBeds);
            map.put("vacant", hTotalBeds - hOccupiedBeds);
            occupancyData.add(map);
        }

        // Recent Admissions
        List<Map<String, Object>> recentAdmissions = students.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", s.getName());
                    map.put("date", s.getCreatedAt());
                    map.put("hostel", s.getBed() != null ? s.getBed().getRoom().getHostel().getName() : "Unassigned");
                    map.put("room", s.getBed() != null ? s.getBed().getRoom().getRoomNumber() : "N/A");
                    return map;
                }).collect(java.util.stream.Collectors.toList());

        // Recent Activities (Payments)
        List<Map<String, Object>> recentActivities = payments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "Payment");
                    map.put("amount", p.getAmount());
                    map.put("student", p.getStudent().getName());
                    map.put("date", p.getCreatedAt());
                    map.put("status", p.getStatus());
                    return map;
                }).collect(java.util.stream.Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalHostels(totalHostels)
                .totalStudents(totalStudents)
                .occupiedStudents(occupiedStudents)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .monthlyRevenue(monthlyRevenue)
                .revenueData(revenueData)
                .occupancyData(occupancyData)
                .recentAdmissions(recentAdmissions)
                .recentActivities(recentActivities)
                .build();
    }
}

package com.hostel.backend.service.impl;

import com.hostel.backend.dto.DashboardStatsDTO;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.enums.HostelStatus;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final HostelRepository hostelRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final BedRepository bedRepository;

    @Override
    public DashboardStatsDTO getDashboardStats(Long hostelId) {
        long totalHostels = hostelId != null ? 1 : hostelRepository.countByIsDeletedFalse();
        
        long totalStudents = hostelId != null 
                ? studentRepository.countByBedRoomHostelIdAndIsDeletedFalse(hostelId)
                : studentRepository.countByIsDeletedFalse();
                
        long occupiedStudents = hostelId != null
                ? studentRepository.countByBedRoomHostelIdAndStatusAndBedIsNotNullAndIsDeletedFalse(hostelId, "ACTIVE")
                : studentRepository.countByStatusAndBedIsNotNullAndIsDeletedFalse("ACTIVE");
        
        long totalBeds = hostelId != null
                ? bedRepository.countBedsByHostelId(hostelId)
                : bedRepository.findByIsDeletedFalse().size(); // Or use a direct count method if added
                
        long occupiedBeds = hostelId != null
                ? bedRepository.countBedsByHostelIdAndStatus(hostelId, BedStatus.OCCUPIED)
                : bedRepository.findByIsDeletedFalse().stream().filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();
        
        double occupancyRate = 0;
        if (totalBeds > 0) {
            occupancyRate = (double) occupiedBeds / totalBeds * 100;
        }

        Double monthlyRevenue = hostelId != null
                ? paymentRepository.sumAmountByHostelIdAndStatus(hostelId, "PAID")
                : paymentRepository.sumAmountByStatus("PAID");
        if (monthlyRevenue == null) monthlyRevenue = 0.0;

        // Dynamic Revenue Data via JPQL
        List<Object[]> rawRevenueData = hostelId != null
                ? paymentRepository.getRevenueDataByHostelId(hostelId)
                : paymentRepository.getRevenueData();
                
        List<Map<String, Object>> revenueData = new ArrayList<>();
        for (Object[] row : rawRevenueData) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] + " " + row[1]); // Month Year
            map.put("total", row[2]); // Sum
            revenueData.add(map);
        }

        // Occupancy Data Dynamic
        List<Map<String, Object>> occupancyData = new ArrayList<>();
        List<Hostel> hostels = hostelId != null 
                ? hostelRepository.findById(hostelId).filter(h -> !h.getIsDeleted() && HostelStatus.ACTIVE.equals(h.getStatus())).map(java.util.Collections::singletonList).orElse(new ArrayList<>())
                : hostelRepository.findByIsDeletedFalse().stream().filter(h -> HostelStatus.ACTIVE.equals(h.getStatus())).collect(Collectors.toList());
        
        for (Hostel h : hostels) {
            Map<String, Object> map = new HashMap<>();
            int hTotalBeds = bedRepository.countBedsByHostelId(h.getId());
            int hOccupiedBeds = bedRepository.countBedsByHostelIdAndStatus(h.getId(), BedStatus.OCCUPIED);
            map.put("name", h.getName());
            map.put("occupied", hOccupiedBeds);
            map.put("vacant", hTotalBeds - hOccupiedBeds);
            occupancyData.add(map);
        }

        // Recent Admissions via DB Top 5
        List<Student> topStudents = hostelId != null
                ? studentRepository.findTop5ByBedRoomHostelIdAndIsDeletedFalseOrderByCreatedAtDesc(hostelId)
                : studentRepository.findTop5ByIsDeletedFalseOrderByCreatedAtDesc();
                
        List<Map<String, Object>> recentAdmissions = topStudents.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", s.getName());
                    map.put("date", s.getCreatedAt());
                    map.put("hostel", s.getBed() != null ? s.getBed().getRoom().getHostel().getName() : "Unassigned");
                    map.put("room", s.getBed() != null ? s.getBed().getRoom().getRoomNumber() : "N/A");
                    return map;
                }).collect(Collectors.toList());

        // Recent Activities via DB Top 5
        List<Payment> topPayments = hostelId != null
                ? paymentRepository.findTop5ByStudentBedRoomHostelIdOrderByCreatedAtDesc(hostelId)
                : paymentRepository.findTop5ByOrderByCreatedAtDesc();
                
        List<Map<String, Object>> recentActivities = topPayments.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "Payment");
                    map.put("amount", p.getAmount());
                    map.put("student", p.getStudent().getName());
                    map.put("date", p.getCreatedAt());
                    map.put("status", p.getStatus());
                    return map;
                }).collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalHostels(totalHostels)
                .totalStudents(totalStudents)
                .occupiedStudents(occupiedStudents)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .vacantBeds(totalBeds - occupiedBeds)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .monthlyRevenue(monthlyRevenue)
                .revenueData(revenueData)
                .occupancyData(occupancyData)
                .recentAdmissions(recentAdmissions)
                .recentActivities(recentActivities)
                .build();
    }
}

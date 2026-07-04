package com.hostel.backend.controller;

import com.hostel.backend.dto.AdmissionRequestResponseDTO;
import com.hostel.backend.dto.AdmissionRejectDTO;
import com.hostel.backend.service.AdmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/admissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
public class AdminAdmissionController {

    private final AdmissionService admissionService;

    @GetMapping("/pending")
    public ResponseEntity<List<AdmissionRequestResponseDTO>> getPendingAdmissions(@RequestParam(required = false) String hostelCode) {
        List<AdmissionRequestResponseDTO> pending;
        if (hostelCode != null && !hostelCode.isEmpty()) {
            pending = admissionService.getPendingByHostel(hostelCode);
        } else {
            pending = admissionService.getPendingRequests();
        }
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdmissionRequestResponseDTO> updateAdmission(@PathVariable Long id, @RequestBody com.hostel.backend.dto.AdmissionRequestCreateDTO dto) {
        String adminUsername = "admin"; // placeholder
        AdmissionRequestResponseDTO updated = admissionService.updateRequest(id, dto, adminUsername);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AdmissionRequestResponseDTO> approveAdmission(@PathVariable Long id) {
        // In a real scenario, retrieve admin username from security context
        String adminUsername = "admin"; // placeholder
        AdmissionRequestResponseDTO approved = admissionService.approveRequest(id, null, adminUsername);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AdmissionRequestResponseDTO> rejectAdmission(@PathVariable Long id,
                                                                       @RequestBody AdmissionRejectDTO rejectDTO) {
        String adminUsername = "admin"; // placeholder
        AdmissionRequestResponseDTO rejected = admissionService.rejectRequest(id, rejectDTO.getReason(), adminUsername);
        return ResponseEntity.ok(rejected);
    }
}

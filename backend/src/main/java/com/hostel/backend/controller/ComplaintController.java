package com.hostel.backend.controller;

import com.hostel.backend.dto.ComplaintDTO;
import com.hostel.backend.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ComplaintDTO> createComplaint(@RequestBody ComplaintDTO complaintDTO) {
        return ResponseEntity.ok(complaintService.createComplaint(complaintDTO));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints(
            @RequestParam(required = false) Long hostelId) {
        if (hostelId != null) {
            return ResponseEntity.ok(complaintService.getComplaintsByHostel(hostelId));
        }
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ComplaintDTO> resolveComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.resolveComplaint(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok().build();
    }
}

package com.hostel.backend.controller;

import com.hostel.backend.dto.HostelDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.service.HostelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostels")
@RequiredArgsConstructor
public class HostelController {

    private final HostelService hostelService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<HostelDTO> createHostel(@Valid @RequestBody HostelDTO hostelDTO) {
        return new ResponseEntity<>(hostelService.createHostel(hostelDTO), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<HostelDTO>> getAllHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<HostelDTO> getHostelById(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getHostelById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<HostelDTO> updateHostel(@PathVariable Long id, @Valid @RequestBody HostelDTO hostelDTO) {
        return ResponseEntity.ok(hostelService.updateHostel(id, hostelDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MessageResponse> deleteHostel(@PathVariable Long id) {
        hostelService.deleteHostel(id);
        return ResponseEntity.ok(new MessageResponse("Hostel deleted successfully"));
    }
}

package com.hostel.backend.controller;

import com.hostel.backend.dto.AdmissionRequestCreateDTO;
import com.hostel.backend.dto.AdmissionRequestResponseDTO;
import com.hostel.backend.service.AdmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/admission")
@RequiredArgsConstructor
public class PublicAdmissionController {

    private final AdmissionService admissionService;

    @PostMapping("/requests")
    public ResponseEntity<AdmissionRequestResponseDTO> submitRequest(@Valid @RequestBody AdmissionRequestCreateDTO dto) {
        AdmissionRequestResponseDTO response = admissionService.submitRequest(dto, null);
        return ResponseEntity.ok(response);
    }
}


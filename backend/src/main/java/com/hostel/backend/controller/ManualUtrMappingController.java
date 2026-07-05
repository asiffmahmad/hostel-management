package com.hostel.backend.controller;

import com.hostel.backend.dto.ManualUtrMappingResultDTO;
import com.hostel.backend.service.ManualUtrMappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/bank/manual-mapping")
@RequiredArgsConstructor
public class ManualUtrMappingController {

    private final ManualUtrMappingService manualUtrMappingService;

    @GetMapping("/template")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getMappingTemplate(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) String hostelName,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        try {
            byte[] excelContent = manualUtrMappingService.generateMappingTemplate(hostelId, month, year);
            
            String fileName = "Pending_Payments_UTR_Mapping.xlsx";
            if (hostelName != null && !hostelName.isEmpty() && month != null && !month.isEmpty() && year != null && !year.isEmpty()) {
                fileName = String.format("%s_%s_%s_Bill.xlsx", hostelName.replaceAll("\\s+", "_"), month, year);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", fileName);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ManualUtrMappingResultDTO> uploadMappingTemplate(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(manualUtrMappingService.uploadMappingTemplate(file));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

package com.hostel.backend.controller;

import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.dto.SystemSettingDTO;
import com.hostel.backend.service.SystemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService service;

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<SystemSettingDTO> createSetting(@Valid @RequestBody SystemSettingDTO dto) {
        return new ResponseEntity<>(service.createSetting(dto), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<SystemSettingDTO>> getAllSettings() {
        return ResponseEntity.ok(service.getAllSettings());
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<SystemSettingDTO> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(service.getSettingByKey(key));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<SystemSettingDTO> updateSetting(@PathVariable String key, @Valid @RequestBody SystemSettingDTO dto) {
        return ResponseEntity.ok(service.updateSetting(key, dto));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MessageResponse> deleteSetting(@PathVariable String key) {
        service.deleteSetting(key);
        return ResponseEntity.ok(new MessageResponse("Setting deleted successfully"));
    }
}

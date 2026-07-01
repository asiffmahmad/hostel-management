package com.hostel.backend.controller;

import com.hostel.backend.dto.BedDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.service.BedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BedDTO> createBed(@Valid @RequestBody BedDTO bedDTO) {
        return new ResponseEntity<>(bedService.createBed(bedDTO), HttpStatus.CREATED);
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<BedDTO>> getBedsByRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(bedService.getBedsByRoomId(roomId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<BedDTO> updateBed(@PathVariable Long id, @Valid @RequestBody BedDTO bedDTO) {
        return ResponseEntity.ok(bedService.updateBed(id, bedDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MessageResponse> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return ResponseEntity.ok(new MessageResponse("Bed deleted successfully"));
    }
}

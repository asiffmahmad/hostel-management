package com.hostel.backend.controller;

import com.hostel.backend.dto.HostelDTO;
import com.hostel.backend.dto.MessageResponse;
import com.hostel.backend.dto.RoomDTO;
import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.service.HostelService;
import com.hostel.backend.service.RoomService;
import com.hostel.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final HostelService hostelService;
    private final RoomService roomService;
    private final StudentService studentService;
    private final BedRepository bedRepository;

    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;

    @GetMapping("/hostels")
    public ResponseEntity<List<HostelDTO>> getHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    @GetMapping("/hostels/{id}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsForHostel(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getAllRooms(id));
    }

    @GetMapping("/rooms/{id}/beds")
    public ResponseEntity<List<Bed>> getVacantBedsForRoom(@PathVariable Long id) {
        List<Bed> vacantBeds = bedRepository.findByRoomId(id).stream()
                .filter(bed -> bed.getStatus() == BedStatus.VACANT)
                .toList();
        return ResponseEntity.ok(vacantBeds);
    }

    @PostMapping("/students/register")
    public ResponseEntity<MessageResponse> registerStudent(@Valid @RequestBody com.hostel.backend.dto.PublicRegistrationRequest request) {
        // Look up hostel
        com.hostel.backend.entity.Hostel hostel = hostelRepository.findByHostelCodeAndIsDeletedFalse(request.getHostelCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid hostel selection"));
                
        // Look up room
        com.hostel.backend.entity.Room room = roomRepository.findByHostelIdAndRoomNumber(hostel.getId(), request.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room selection"));
                
        // Look up bed
        Bed bed = bedRepository.findByRoomIdAndBedNumberAndIsDeletedFalse(room.getId(), request.getBedName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid bed selection"));
                
        if (bed.getStatus() != BedStatus.VACANT) {
            throw new IllegalArgumentException("Selected bed is not vacant");
        }

        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setName(request.getName());
        studentDTO.setEmail(request.getEmail());
        studentDTO.setPhone(request.getPhone());
        studentDTO.setParentPhone(request.getParentPhone());
        studentDTO.setFatherName(request.getFatherName());
        studentDTO.setAadhaarNumber(request.getAadhaarNumber());
        studentDTO.setAddress(request.getAddress());
        studentDTO.setBedId(bed.getId());
        studentDTO.setStudentId("STU" + System.currentTimeMillis());
        studentDTO.setMonthlyRent(room.getBaseRent() != null ? room.getBaseRent() : 5000.0);
        studentDTO.setAdvanceDeposit(0.0);

        studentService.createStudent(studentDTO);
        return ResponseEntity.ok(new MessageResponse("Student registered and assigned successfully"));
    }
}

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
import org.springframework.transaction.annotation.Transactional;

import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.BankTransactionRepository;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.dto.PublicPaymentConfirmRequest;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.time.LocalDateTime;

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
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final com.hostel.backend.repository.ExternalPaymentRepository externalPaymentRepository;

    @GetMapping("/hostels")
    public ResponseEntity<List<HostelDTO>> getHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    @GetMapping("/hostels/{id}/rooms")
    public ResponseEntity<List<RoomDTO>> getRoomsForHostel(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getAllRooms(id));
    }

    @GetMapping("/rooms/{id}/beds")
    public ResponseEntity<List<com.hostel.backend.dto.BedDTO>> getVacantBedsForRoom(@PathVariable Long id) {
        List<com.hostel.backend.dto.BedDTO> vacantBeds = bedRepository.findByRoomId(id).stream()
                .filter(bed -> bed.getStatus() == BedStatus.VACANT)
                .map(bed -> {
                    com.hostel.backend.dto.BedDTO dto = new com.hostel.backend.dto.BedDTO();
                    dto.setId(bed.getId());
                    dto.setBedNumber(bed.getBedNumber());
                    dto.setBedName(bed.getBedName());
                    dto.setStatus(bed.getStatus());
                    return dto;
                })
                .toList();
        return ResponseEntity.ok(vacantBeds);
    }

    @PostMapping("/students/register")
    public ResponseEntity<MessageResponse> registerStudent(@Valid @RequestBody com.hostel.backend.dto.PublicRegistrationRequest request) {
        // Look up hostel
        com.hostel.backend.entity.Hostel hostel = hostelRepository.findByHostelCodeAndIsDeletedFalse(request.getHostelCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid hostel selection"));
                
        // Look up room
        com.hostel.backend.entity.Room room = roomRepository.findByHostelIdAndRoomNumberAndIsDeletedFalse(hostel.getId(), request.getRoomNumber())
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

    @Transactional(readOnly = true)
    @GetMapping("/students/lookup")
    public ResponseEntity<?> lookupStudentByPhone(@RequestParam String phone) {
        String phoneHash = com.hostel.backend.security.EncryptionContext.hash(phone);
        List<Student> students = studentRepository.findByPhoneHashAndIsDeletedFalse(phoneHash);
        if (students == null || students.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("No active student found with this phone number. Please check the number and try again."));
        }
        
        // Use the first active student found for this phone number
        Student student = students.get(0);
        
        List<Payment> existingPayments = paymentRepository.findByStudentId(student.getId());
        List<Map<String, Object>> paymentSummary = existingPayments.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("month", p.getMonth());
            map.put("year", p.getYear());
            map.put("status", p.getStatus());
            map.put("dueAmount", p.getDueAmount());
            return map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("id", student.getId());
        response.put("name", student.getName());
        response.put("monthlyRent", student.getMonthlyRent());
        response.put("payments", paymentSummary);
        
        if (student.getBed() != null && student.getBed().getRoom() != null) {
            response.put("roomNumber", student.getBed().getRoom().getRoomNumber());
            if (student.getBed().getRoom().getHostel() != null) {
                response.put("hostelName", student.getBed().getRoom().getHostel().getName());
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @Transactional
    @PostMapping("/payments/confirm")
    public ResponseEntity<MessageResponse> confirmPayment(@Valid @RequestBody PublicPaymentConfirmRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                
        if (externalPaymentRepository.existsByUtrNumberAndIsDeletedFalse(request.getUtrNumber())) {
            throw new IllegalArgumentException("This UTR has already been submitted and is pending or validated.");
        }
        
        if (bankTransactionRepository.findByUtrNumberAndIsDeletedFalse(request.getUtrNumber())
                .filter(com.hostel.backend.entity.BankTransaction::getIsMapped).isPresent()) {
            throw new IllegalArgumentException("This UTR has already been mapped to a payment.");
        }
        
        com.hostel.backend.entity.ExternalPayment ep = new com.hostel.backend.entity.ExternalPayment();
        ep.setStudent(student);
        ep.setMonth(request.getMonth().toUpperCase());
        ep.setYear(request.getYear());
        ep.setUtrNumber(request.getUtrNumber().toUpperCase());
        ep.setAmount(request.getAmount() != null ? request.getAmount().doubleValue() : 0.0);
        ep.setTransactionDate(java.time.LocalDate.now());
        ep.setValidationStatus("PENDING");
        
        externalPaymentRepository.save(ep);
        
        return ResponseEntity.ok(new MessageResponse("Payment details submitted successfully! The admin will validate your UTR shortly."));
    }
}

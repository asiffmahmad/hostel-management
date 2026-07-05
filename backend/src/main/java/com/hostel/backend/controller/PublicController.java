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

import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.dto.PublicPaymentConfirmRequest;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
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
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;

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

    @GetMapping("/students/lookup")
    public ResponseEntity<?> lookupStudentByPhone(@RequestParam String phone) {
        Optional<Student> studentOpt = studentRepository.findByPhoneAndIsDeletedFalse(phone);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("No student found with this phone number"));
        }
        
        Student student = studentOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", student.getId());
        response.put("name", student.getName());
        response.put("monthlyRent", student.getMonthlyRent());
        
        if (student.getBed() != null && student.getBed().getRoom() != null) {
            response.put("roomNumber", student.getBed().getRoom().getRoomNumber());
            if (student.getBed().getRoom().getHostel() != null) {
                response.put("hostelName", student.getBed().getRoom().getHostel().getName());
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payments/confirm")
    public ResponseEntity<MessageResponse> confirmPayment(@Valid @RequestBody PublicPaymentConfirmRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                
        if (paymentRepository.existsByUtrNumber(request.getUtrNumber())) {
            throw new IllegalArgumentException("UTR Number already exists. Payment might have been confirmed already.");
        }
        
        List<Payment> existingPayments = paymentRepository.findByStudentId(student.getId());
        Optional<Payment> pendingPayment = existingPayments.stream()
                .filter(p -> p.getMonth().equalsIgnoreCase(request.getMonth()) 
                        && p.getYear().equals(request.getYear())
                        && p.getStatus() != null 
                        && p.getStatus().startsWith("PENDING"))
                .findFirst();
                
        if (pendingPayment.isPresent()) {
            Payment payment = pendingPayment.get();
            payment.setUtrNumber(request.getUtrNumber());
            payment.setStatus("PENDING_VERIFICATION");
            
            // if amount paid is >= expected amount, we set dueAmount correctly later, 
            // for now, we just update the amount they confirmed to have paid.
            payment.setAmount(request.getAmount());
            if (payment.getExpectedAmount() != null) {
                payment.setDueAmount(Math.max(0, payment.getExpectedAmount() - request.getAmount()));
            }
            payment.setPaymentSource("PUBLIC_FORM");
            paymentRepository.save(payment);
        } else {
            Payment newPayment = new Payment();
            newPayment.setStudent(student);
            newPayment.setMonth(request.getMonth().toUpperCase());
            newPayment.setYear(request.getYear());
            newPayment.setAmount(request.getAmount());
            newPayment.setExpectedAmount(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
            newPayment.setDueAmount(Math.max(0, newPayment.getExpectedAmount() - request.getAmount()));
            newPayment.setUtrNumber(request.getUtrNumber());
            newPayment.setStatus("PENDING_VERIFICATION");
            newPayment.setPaymentSource("PUBLIC_FORM");
            paymentRepository.save(newPayment);
        }
        
        return ResponseEntity.ok(new MessageResponse("Payment details submitted successfully. Pending verification."));
    }
}

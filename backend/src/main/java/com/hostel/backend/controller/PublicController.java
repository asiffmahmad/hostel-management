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

    @GetMapping("/students/lookup")
    public ResponseEntity<?> lookupStudentByPhone(@RequestParam String phone, @RequestParam String studentId) {
        String phoneHash = com.hostel.backend.security.EncryptionContext.hash(phone);
        List<Student> students = studentRepository.findByPhoneHashAndIsDeletedFalse(phoneHash);
        if (students == null || students.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("No student found with this phone number and Student ID combination"));
        }
        
        // Find the student matching the provided studentId (System ID STU...)
        Optional<Student> matchedStudentOpt = students.stream()
                .filter(s -> s.getStudentId().equalsIgnoreCase(studentId))
                .findFirst();
                
        if (matchedStudentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("No student found with this phone number and Student ID combination"));
        }
        
        Student student = matchedStudentOpt.get();
        
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

    @PostMapping("/payments/confirm")
    public ResponseEntity<MessageResponse> confirmPayment(@Valid @RequestBody PublicPaymentConfirmRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                
        if (paymentRepository.existsByUtrNumber(request.getUtrNumber())) {
            throw new IllegalArgumentException("UTR Number already exists. Payment might have been confirmed already.");
        }
        
        Optional<BankTransaction> bankTxnOpt = bankTransactionRepository.findByUtrNumberAndIsDeletedFalse(request.getUtrNumber());
        if (bankTxnOpt.isEmpty()) {
            throw new IllegalArgumentException("UTR not found in bank records. Please check the UTR number or wait for the bank transaction to be imported by the admin.");
        }
        
        BankTransaction bankTxn = bankTxnOpt.get();
        if (bankTxn.getIsMapped()) {
            throw new IllegalArgumentException("This UTR has already been mapped to another student's payment.");
        }
        
        // At this point, the UTR is valid and unmapped. Map it!
        List<Payment> existingPayments = paymentRepository.findByStudentId(student.getId());
        Optional<Payment> pendingPayment = existingPayments.stream()
                .filter(p -> p.getMonth().equalsIgnoreCase(request.getMonth()) 
                        && p.getYear().equals(request.getYear())
                        && p.getStatus() != null 
                        && p.getStatus().startsWith("PENDING"))
                .findFirst();
                
        Payment payment;
        if (pendingPayment.isPresent()) {
            payment = pendingPayment.get();
        } else {
            payment = new Payment();
            payment.setStudent(student);
            payment.setMonth(request.getMonth().toUpperCase());
            payment.setYear(request.getYear());
            payment.setExpectedAmount(student.getMonthlyRent() != null ? student.getMonthlyRent() : 0.0);
        }
        
        payment.setUtrNumber(request.getUtrNumber());
        // Map to bankTxn
        payment.setAmount(bankTxn.getAmount().doubleValue());
        if (payment.getExpectedAmount() != null) {
            payment.setDueAmount(Math.max(0, payment.getExpectedAmount() - payment.getAmount()));
        }
        payment.setStatus("PAID"); // Automatically paid since it matched BankTransaction!
        payment.setPaymentSource("PUBLIC_FORM");
        payment = paymentRepository.save(payment);
        
        // Update BankTransaction to mark as mapped
        bankTxn.setIsMapped(true);
        bankTxn.setMappedStudentId(student.getId());
        bankTxn.setMappedPaymentId(payment.getId());
        bankTxn.setMappedAt(LocalDateTime.now());
        bankTxn.setMappedBy("PUBLIC_FORM_AUTO");
        bankTransactionRepository.save(bankTxn);
        
        return ResponseEntity.ok(new MessageResponse("Payment automatically verified and successful!"));
    }
}

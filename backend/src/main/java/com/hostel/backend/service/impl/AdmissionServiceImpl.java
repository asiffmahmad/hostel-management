package com.hostel.backend.service.impl;

import com.hostel.backend.dto.AdmissionRequestCreateDTO;
import com.hostel.backend.dto.AdmissionRequestResponseDTO;
import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.HostelAdmissionRequest;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.enums.AdmissionStatus;
import com.hostel.backend.enums.AuditAction;
import com.hostel.backend.repository.HostelAdmissionRequestRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.service.AdmissionService;
import com.hostel.backend.service.AuditLogService;
import com.hostel.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdmissionServiceImpl implements AdmissionService {

    private final HostelAdmissionRequestRepository admissionRepo;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final StudentService studentService;
    private final AuditLogService auditLogService;

    @Override
    public AdmissionRequestResponseDTO submitRequest(AdmissionRequestCreateDTO dto, String username) {
        // Validate hostel
        Hostel hostel = hostelRepository.findByHostelCodeAndIsDeletedFalse(dto.getHostelCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid hostel selection"));
        // Validate room
        Room room = roomRepository.findByHostelIdAndRoomNumberAndIsDeletedFalse(hostel.getId(), dto.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room selection"));
        // Bed validation is deferred to admin approval. Store bedName as provided (may be empty).
        // No lookup of Bed entity here.
        // Bed will be assigned during admin approval.
        // If bedName is provided, keep it; otherwise leave null.
        // (Optional: you could store a placeholder or leave null.)
        // Create admission request entity
        HostelAdmissionRequest request = HostelAdmissionRequest.builder()
                .studentName(dto.getStudentName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .parentPhone(dto.getParentPhone())
                .fatherName(dto.getFatherName())
                .aadhaarNumber(dto.getAadhaarNumber())
                .address(dto.getAddress())
                .hostelCode(dto.getHostelCode())
                .roomNumber(dto.getRoomNumber())
                .bedName(dto.getBedName() != null && !dto.getBedName().isEmpty() ? dto.getBedName() : "Pending Assignment")
                .status(AdmissionStatus.PENDING)
                .build();
        HostelAdmissionRequest saved = admissionRepo.save(request);
        // Audit log
        auditLogService.logAction("HOSTEL_ADMISSION_REQUEST", saved.getId(), AuditAction.ADMISSION_SUBMITTED.name(), username != null ? username : "PUBLIC", "Admission request submitted");
        return toResponseDto(saved);
    }

    @Override
    public AdmissionRequestResponseDTO updateRequest(Long id, AdmissionRequestCreateDTO dto, String adminUsername) {
        HostelAdmissionRequest request = admissionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admission request not found"));

        if (request.getStatus() != AdmissionStatus.PENDING) {
            throw new IllegalArgumentException("Only pending admission requests can be edited");
        }

        // Validate hostel
        Hostel hostel = hostelRepository.findByHostelCodeAndIsDeletedFalse(dto.getHostelCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid hostel selection"));
        
        // Validate room
        Room room = roomRepository.findByHostelIdAndRoomNumberAndIsDeletedFalse(hostel.getId(), dto.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room selection"));

        request.setStudentName(dto.getStudentName());
        request.setEmail(dto.getEmail());
        request.setPhone(dto.getPhone());
        request.setParentPhone(dto.getParentPhone());
        request.setFatherName(dto.getFatherName());
        request.setAadhaarNumber(dto.getAadhaarNumber());
        request.setAddress(dto.getAddress());
        request.setHostelCode(dto.getHostelCode());
        request.setRoomNumber(dto.getRoomNumber());
        request.setBedName(dto.getBedName() != null && !dto.getBedName().isEmpty() ? dto.getBedName() : "Pending Assignment");

        HostelAdmissionRequest saved = admissionRepo.save(request);

        auditLogService.logAction("HOSTEL_ADMISSION_REQUEST", saved.getId(), AuditAction.ADMISSION_UPDATED.name(), adminUsername != null ? adminUsername : "SYSTEM", "Admission request updated");

        return toResponseDto(saved);
    }

    @Override
    public List<AdmissionRequestResponseDTO> getPendingRequests() {
        return admissionRepo.findAll().stream()
                .filter(r -> r.getStatus() == AdmissionStatus.PENDING)
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdmissionRequestResponseDTO> getPendingByHostel(String hostelCode) {
        return admissionRepo.findAll().stream()
                .filter(r -> r.getStatus() == AdmissionStatus.PENDING && hostelCode.equals(r.getHostelCode()))
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdmissionRequestResponseDTO getRequest(Long id) {
        HostelAdmissionRequest request = admissionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admission request not found"));
        return toResponseDto(request);
    }

    @Override
    public AdmissionRequestResponseDTO approveRequest(Long id, String bedName, String adminUsername) {
        HostelAdmissionRequest request = admissionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admission request not found"));
        if (request.getStatus() != AdmissionStatus.PENDING) {
            throw new IllegalArgumentException("Admission request is not pending");
        }
        // Re-validate hostel/room/bed (in case state changed)
        Hostel hostel = hostelRepository.findByHostelCodeAndIsDeletedFalse(request.getHostelCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid hostel selection"));
        Room room = roomRepository.findByHostelIdAndRoomNumberAndIsDeletedFalse(hostel.getId(), request.getRoomNumber())
                .orElseThrow(() -> new IllegalArgumentException("Invalid room selection"));
        List<Bed> beds = bedRepository.findByRoomIdAndIsDeletedFalse(room.getId());
        Bed bed = beds.stream()
                .filter(b -> b.getStatus() == com.hostel.backend.enums.BedStatus.VACANT)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No vacant beds available in this room"));
        // Build StudentDTO similar to public registration flow
        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setName(request.getStudentName());
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
        // Persist student
        studentService.createStudent(studentDTO);
        // Update admission status
        request.setStatus(AdmissionStatus.APPROVED);
        HostelAdmissionRequest saved = admissionRepo.save(request);
        // Audit log
        auditLogService.logAction("HOSTEL_ADMISSION_REQUEST", saved.getId(), AuditAction.ADMISSION_APPROVED.name(), adminUsername, "Admission approved and student created");
        return toResponseDto(saved);
    }

    @Override
    public AdmissionRequestResponseDTO rejectRequest(Long id, String reason, String adminUsername) {
        HostelAdmissionRequest request = admissionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admission request not found"));
        if (request.getStatus() != AdmissionStatus.PENDING) {
            throw new IllegalArgumentException("Admission request is not pending");
        }
        request.setStatus(AdmissionStatus.REJECTED);
        request.setRejectionReason(reason);
        HostelAdmissionRequest saved = admissionRepo.save(request);
        auditLogService.logAction("HOSTEL_ADMISSION_REQUEST", saved.getId(), AuditAction.ADMISSION_REJECTED.name(), adminUsername, "Admission rejected: " + reason);
        return toResponseDto(saved);
    }

    private AdmissionRequestResponseDTO toResponseDto(HostelAdmissionRequest entity) {
        AdmissionRequestResponseDTO dto = new AdmissionRequestResponseDTO();
        dto.setId(entity.getId());
        dto.setStudentName(entity.getStudentName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setParentPhone(entity.getParentPhone());
        dto.setFatherName(entity.getFatherName());
        dto.setAadhaarNumber(entity.getAadhaarNumber());
        dto.setAddress(entity.getAddress());
        dto.setHostelCode(entity.getHostelCode());
        dto.setRoomNumber(entity.getRoomNumber());
        dto.setBedName(entity.getBedName());
        dto.setStatus(entity.getStatus());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}

package com.hostel.backend.service.impl;

import com.hostel.backend.dto.ComplaintDTO;
import com.hostel.backend.entity.Complaint;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import com.hostel.backend.repository.ComplaintRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;

    @Override
    public ComplaintDTO createComplaint(ComplaintDTO complaintDTO) {
        Hostel hostel = hostelRepository.findById(complaintDTO.getHostelId())
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        Room room = roomRepository.findById(complaintDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Complaint complaint = Complaint.builder()
                .hostel(hostel)
                .room(room)
                .type(complaintDTO.getType())
                .description(complaintDTO.getDescription())
                .status("PENDING")
                .build();

        return mapToDTO(complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintDTO> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintDTO> getComplaintsByHostel(Long hostelId) {
        return complaintRepository.findByHostelId(hostelId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ComplaintDTO resolveComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("RESOLVED");
        return mapToDTO(complaintRepository.save(complaint));
    }

    @Override
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }

    private ComplaintDTO mapToDTO(Complaint complaint) {
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .hostelId(complaint.getHostel().getId())
                .hostelName(complaint.getHostel().getName())
                .roomId(complaint.getRoom().getId())
                .roomNumber(complaint.getRoom().getRoomNumber())
                .type(complaint.getType())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}

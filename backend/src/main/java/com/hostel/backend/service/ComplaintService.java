package com.hostel.backend.service;

import com.hostel.backend.dto.ComplaintDTO;

import java.util.List;

public interface ComplaintService {
    ComplaintDTO createComplaint(ComplaintDTO complaintDTO);
    List<ComplaintDTO> getAllComplaints();
    List<ComplaintDTO> getComplaintsByHostel(Long hostelId);
    ComplaintDTO resolveComplaint(Long id);
    void deleteComplaint(Long id);
}

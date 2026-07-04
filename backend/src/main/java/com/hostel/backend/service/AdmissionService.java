package com.hostel.backend.service;

import com.hostel.backend.dto.AdmissionRequestCreateDTO;
import com.hostel.backend.dto.AdmissionRequestResponseDTO;
import java.util.List;

public interface AdmissionService {
    AdmissionRequestResponseDTO submitRequest(AdmissionRequestCreateDTO dto, String username);
    AdmissionRequestResponseDTO updateRequest(Long id, AdmissionRequestCreateDTO dto, String adminUsername);
    List<AdmissionRequestResponseDTO> getPendingRequests();
    List<AdmissionRequestResponseDTO> getPendingByHostel(String hostelCode);
    AdmissionRequestResponseDTO getRequest(Long id);
    AdmissionRequestResponseDTO approveRequest(Long id, String bedName, String adminUsername);
    AdmissionRequestResponseDTO rejectRequest(Long id, String reason, String adminUsername);
}

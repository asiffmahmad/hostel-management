package com.hostel.backend.service;

import com.hostel.backend.dto.HostelDTO;
import java.util.List;

public interface HostelService {
    HostelDTO createHostel(HostelDTO hostelDTO);
    HostelDTO updateHostel(Long id, HostelDTO hostelDTO);
    HostelDTO getHostelById(Long id);
    List<HostelDTO> getAllHostels();
    void deleteHostel(Long id);
}

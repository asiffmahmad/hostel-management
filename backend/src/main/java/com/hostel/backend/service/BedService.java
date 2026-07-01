package com.hostel.backend.service;

import com.hostel.backend.dto.BedDTO;

import java.util.List;

public interface BedService {
    BedDTO createBed(BedDTO bedDTO);
    BedDTO updateBed(Long id, BedDTO bedDTO);
    BedDTO getBedById(Long id);
    List<BedDTO> getBedsByRoomId(Long roomId);
    void deleteBed(Long id);
}

package com.hostel.backend.service;

import com.hostel.backend.dto.RoomDTO;

import java.util.List;

public interface RoomService {
    RoomDTO createRoom(RoomDTO roomDTO);
    List<RoomDTO> getRoomsByHostelId(Long hostelId);
    RoomDTO getRoomById(Long id);
    RoomDTO updateRoom(Long id, RoomDTO roomDTO);
    void deleteRoom(Long id);
}

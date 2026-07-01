package com.hostel.backend.service.impl;

import com.hostel.backend.dto.RoomDTO;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.mapper.RoomMapper;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HostelRepository hostelRepository;
    private final BedRepository bedRepository;
    private final RoomMapper roomMapper;

    @Override
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Hostel hostel = hostelRepository.findById(roomDTO.getHostelId())
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        
        Room room = roomMapper.toEntity(roomDTO);
        room.setHostel(hostel);
        
        Room savedRoom = roomRepository.save(room);
        return mapToDtoWithOccupancy(savedRoom);
    }

    @Override
    public List<RoomDTO> getRoomsByHostelId(Long hostelId) {
        List<Room> rooms = roomRepository.findByHostelId(hostelId);
        return rooms.stream().map(this::mapToDtoWithOccupancy).collect(Collectors.toList());
    }

    @Override
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return mapToDtoWithOccupancy(room);
    }

    @Override
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomName(roomDTO.getRoomName());
        room.setFloor(roomDTO.getFloor());
        room.setCapacity(roomDTO.getCapacity());
        room.setType(roomDTO.getType());
        room.setDescription(roomDTO.getDescription());
        room.setStatus(roomDTO.getStatus());
        
        Room updatedRoom = roomRepository.save(room);
        return mapToDtoWithOccupancy(updatedRoom);
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        long occupiedBeds = bedRepository.findByRoomId(id).stream()
                .filter(b -> b.getStatus() == BedStatus.OCCUPIED)
                .count();
        if (occupiedBeds > 0) {
            throw new IllegalStateException("Cannot delete room with occupied beds.");
        }
        
        room.setIsDeleted(true);
        room.setIsActive(false);
        roomRepository.save(room);
    }

    private RoomDTO mapToDtoWithOccupancy(Room room) {
        RoomDTO dto = roomMapper.toDTO(room);
        int occupied = (int) bedRepository.findByRoomId(room.getId()).stream()
                .filter(b -> b.getStatus() == BedStatus.OCCUPIED)
                .count();
        dto.setOccupiedBeds(occupied);
        dto.setVacantBeds(room.getCapacity() - occupied);
        return dto;
    }
}

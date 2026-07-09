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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
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

        // Auto-generate beds based on capacity
        if (roomDTO.getCapacity() != null && roomDTO.getCapacity() > 0) {
            for (int i = 1; i <= roomDTO.getCapacity(); i++) {
                com.hostel.backend.entity.Bed bed = new com.hostel.backend.entity.Bed();
                bed.setRoom(savedRoom);
                bed.setBedNumber("B" + i);
                bed.setBedName("Bed " + i);
                bed.setStatus(com.hostel.backend.enums.BedStatus.VACANT);
                bedRepository.save(bed);
            }
        }

        return mapToDtoWithOccupancy(savedRoom);
    }

    @Override
    public List<RoomDTO> getAllRooms(Long hostelId) {
        if (hostelId != null) {
            return getRoomsByHostelId(hostelId);
        }
        return roomRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDtoWithOccupancy)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> getRoomsByHostelId(Long hostelId) {
        List<Room> rooms = roomRepository.findByHostelIdAndIsDeletedFalse(hostelId);
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
        
        List<com.hostel.backend.entity.Bed> beds = bedRepository.findByRoomIdAndIsDeletedFalse(id);
        
        long occupiedBeds = beds.stream()
                .filter(b -> b.getStatus() == BedStatus.OCCUPIED)
                .count();
        if (occupiedBeds > 0) {
            throw new IllegalStateException("Cannot delete room with occupied beds.");
        }
        
        // Soft delete all beds
        for (com.hostel.backend.entity.Bed bed : beds) {
            bed.setIsDeleted(true);
            bed.setIsActive(false);
            bedRepository.save(bed);
        }
        
        room.setIsDeleted(true);
        room.setIsActive(false);
        roomRepository.save(room);
    }

    private RoomDTO mapToDtoWithOccupancy(Room room) {
        RoomDTO dto = roomMapper.toDTO(room);
        int occupied = (int) bedRepository.findByRoomIdAndIsDeletedFalse(room.getId()).stream()
                .filter(b -> b.getStatus() == BedStatus.OCCUPIED)
                .count();
        dto.setOccupiedBeds(occupied);
        dto.setVacantBeds(room.getCapacity() - occupied);
        return dto;
    }
}

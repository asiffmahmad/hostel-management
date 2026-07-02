package com.hostel.backend.service;

import com.hostel.backend.dto.BedDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Room;
import com.hostel.backend.entity.Student;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.BedMapper;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BedServiceImpl implements BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final BedMapper bedMapper;

    @Override
    public BedDTO createBed(BedDTO bedDTO) {
        Room room = roomRepository.findById(bedDTO.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + bedDTO.getRoomId()));
                
        Bed bed = bedMapper.toEntity(bedDTO);
        bed.setRoom(room);
        Bed savedBed = bedRepository.save(bed);
        return bedMapper.toDto(savedBed);
    }

    @Override
    public BedDTO updateBed(Long id, BedDTO bedDTO) {
        Bed existingBed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));

        if (bedDTO.getRoomId() != null && !existingBed.getRoom().getId().equals(bedDTO.getRoomId())) {
            Room room = roomRepository.findById(bedDTO.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + bedDTO.getRoomId()));
            existingBed.setRoom(room);
        }

        existingBed.setBedNumber(bedDTO.getBedNumber());
        existingBed.setBedName(bedDTO.getBedName());
        existingBed.setStatus(bedDTO.getStatus());
        
        if (bedDTO.getStudentId() != null) {
            Student student = studentRepository.findById(bedDTO.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            existingBed.setStudent(student);
        } else {
            existingBed.setStudent(null);
        }

        Bed updatedBed = bedRepository.save(existingBed);
        return bedMapper.toDto(updatedBed);
    }

    @Override
    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));
        return bedMapper.toDto(bed);
    }

    @Override
    public List<BedDTO> getBedsByRoomId(Long roomId) {
        return bedRepository.findByRoomIdAndIsDeletedFalse(roomId).stream()
                .map(bedMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BedDTO> getAllBeds(Long hostelId) {
        if (hostelId != null) {
            return bedRepository.findByRoomHostelIdAndIsDeletedFalse(hostelId).stream()
                    .map(bedMapper::toDto)
                    .collect(Collectors.toList());
        }
        return bedRepository.findByIsDeletedFalse().stream()
                .map(bedMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));
        if (bed.getStatus() == BedStatus.OCCUPIED || bed.getStudent() != null) {
            throw new IllegalStateException("Cannot delete an occupied bed.");
        }
        bed.setIsActive(false);
        bed.setIsDeleted(true);
        bedRepository.save(bed);
    }
}

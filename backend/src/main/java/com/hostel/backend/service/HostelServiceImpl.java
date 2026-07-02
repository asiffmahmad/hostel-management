package com.hostel.backend.service;

import com.hostel.backend.dto.HostelDTO;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.HostelMapper;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelServiceImpl implements HostelService {

    private final HostelRepository hostelRepository;
    private final BedRepository bedRepository;
    private final PaymentRepository paymentRepository;
    private final HostelMapper hostelMapper;

    @Override
    public HostelDTO createHostel(HostelDTO hostelDTO) {
        Hostel hostel = hostelMapper.toEntity(hostelDTO);
        Hostel savedHostel = hostelRepository.save(hostel);
        return mapToDtoWithDynamicStats(savedHostel);
    }

    @Override
    public HostelDTO updateHostel(Long id, HostelDTO hostelDTO) {
        Hostel existingHostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + id));

        existingHostel.setName(hostelDTO.getName());
        existingHostel.setHostelCode(hostelDTO.getHostelCode());
        existingHostel.setAddress(hostelDTO.getAddress());
        existingHostel.setDescription(hostelDTO.getDescription());
        existingHostel.setHostelType(hostelDTO.getHostelType());
        existingHostel.setTotalFloors(hostelDTO.getTotalFloors());
        existingHostel.setNotes(hostelDTO.getNotes());
        existingHostel.setStatus(hostelDTO.getStatus());

        Hostel updatedHostel = hostelRepository.save(existingHostel);
        return mapToDtoWithDynamicStats(updatedHostel);
    }

    @Override
    public HostelDTO getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + id));
        return mapToDtoWithDynamicStats(hostel);
    }

    @Override
    public List<HostelDTO> getAllHostels() {
        return hostelRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDtoWithDynamicStats)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteHostel(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + id));
                
        int occupiedBeds = bedRepository.countBedsByHostelIdAndStatus(id, BedStatus.OCCUPIED);
        if (occupiedBeds > 0) {
            throw new IllegalStateException("Cannot delete hostel with occupied beds.");
        }
        
        // Soft delete
        hostel.setIsDeleted(true);
        hostel.setIsActive(false);
        hostelRepository.save(hostel);
    }
    
    private HostelDTO mapToDtoWithDynamicStats(Hostel hostel) {
        HostelDTO dto = hostelMapper.toDto(hostel);
        
        int totalBeds = bedRepository.countBedsByHostelId(hostel.getId());
        int occupiedBeds = bedRepository.countBedsByHostelIdAndStatus(hostel.getId(), BedStatus.OCCUPIED);
        
        dto.setTotalBeds(totalBeds);
        dto.setOccupiedBeds(occupiedBeds);
        dto.setVacantBeds(totalBeds - occupiedBeds);
        
        Double currentCollection = paymentRepository.sumAmountByHostelIdAndStatus(hostel.getId(), "PAID");
        Double pendingCollection = paymentRepository.sumAmountByHostelIdAndStatus(hostel.getId(), "PENDING");
        
        dto.setCurrentCollection(currentCollection);
        dto.setPendingCollection(pendingCollection);
        
        return dto;
    }
}

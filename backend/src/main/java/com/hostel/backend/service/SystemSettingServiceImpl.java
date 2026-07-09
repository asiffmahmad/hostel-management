package com.hostel.backend.service;

import com.hostel.backend.dto.SystemSettingDTO;
import com.hostel.backend.entity.SystemSetting;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository repository;

    @Override
    public SystemSettingDTO createSetting(SystemSettingDTO dto) {
        if (repository.findBySettingKey(dto.getSettingKey()).isPresent()) {
            throw new IllegalArgumentException("Setting key already exists");
        }
        SystemSetting entity = new SystemSetting();
        entity.setSettingKey(dto.getSettingKey());
        entity.setSettingValue(dto.getSettingValue());
        entity.setDescription(dto.getDescription());
        return mapToDto(repository.save(entity));
    }

    @Override
    public SystemSettingDTO updateSetting(String key, SystemSettingDTO dto) {
        SystemSetting entity = repository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found"));
        entity.setSettingValue(dto.getSettingValue());
        entity.setDescription(dto.getDescription());
        return mapToDto(repository.save(entity));
    }

    @Override
    public SystemSettingDTO getSettingByKey(String key) {
        SystemSetting entity = repository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found"));
        return mapToDto(entity);
    }

    @Override
    public List<SystemSettingDTO> getAllSettings() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public void deleteSetting(String key) {
        SystemSetting entity = repository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found"));
        repository.delete(entity);
    }

    private SystemSettingDTO mapToDto(SystemSetting entity) {
        SystemSettingDTO dto = new SystemSettingDTO();
        dto.setId(entity.getId());
        dto.setSettingKey(entity.getSettingKey());
        dto.setSettingValue(entity.getSettingValue());
        dto.setDescription(entity.getDescription());
        return dto;
    }
}

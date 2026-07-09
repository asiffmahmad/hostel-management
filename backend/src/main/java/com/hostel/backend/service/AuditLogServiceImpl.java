package com.hostel.backend.service;

import com.hostel.backend.dto.AuditLogDTO;
import com.hostel.backend.mapper.AuditLogMapper;
import com.hostel.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public List<AuditLogDTO> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogDTO> getAuditLogsByEntity(String entityName, Long entityId) {
        return auditLogRepository.findByEntityNameAndEntityId(entityName, entityId).stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void logAction(String entityName, Long entityId, String action, String username, String details) {
        com.hostel.backend.entity.AuditLog log = com.hostel.backend.entity.AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .username(username)
                .newValues(details)
                .build();
        auditLogRepository.save(log);
    }
}

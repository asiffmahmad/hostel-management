package com.hostel.backend.service;

import com.hostel.backend.dto.AuditLogDTO;

import java.util.List;

public interface AuditLogService {
    List<AuditLogDTO> getAllAuditLogs();
    List<AuditLogDTO> getAuditLogsByEntity(String entityName, Long entityId);
    void logAction(String entityName, Long entityId, String action, String username, String details);
}

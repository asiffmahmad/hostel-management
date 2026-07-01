package com.hostel.backend.service;

import com.hostel.backend.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(NotificationDTO notificationDTO);
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    List<NotificationDTO> getUnreadNotificationsByUserId(Long userId);
    void markAsRead(Long id);
    void deleteNotification(Long id);
}

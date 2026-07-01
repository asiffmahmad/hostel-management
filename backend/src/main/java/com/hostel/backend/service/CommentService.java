package com.hostel.backend.service;

import com.hostel.backend.dto.CommentDTO;

import java.util.List;

public interface CommentService {
    CommentDTO addComment(CommentDTO commentDTO);
    List<CommentDTO> getCommentsByEntity(String entityType, Long entityId);
    void deleteComment(Long id);
}

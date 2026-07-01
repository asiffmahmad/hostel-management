package com.hostel.backend.mapper;

import com.hostel.backend.dto.CommentDTO;
import com.hostel.backend.entity.Comment;
import com.hostel.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentDTO toDto(Comment entity) {
        if (entity == null) {
            return null;
        }

        CommentDTO dto = new CommentDTO();
        dto.setId(entity.getId());
        dto.setEntityType(entity.getEntityType());
        dto.setEntityId(entity.getEntityId());
        dto.setComment(entity.getComment());

        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }

        return dto;
    }

    public Comment toEntity(CommentDTO dto) {
        if (dto == null) {
            return null;
        }

        Comment entity = new Comment();
        entity.setId(dto.getId());
        entity.setEntityType(dto.getEntityType());
        entity.setEntityId(dto.getEntityId());
        entity.setComment(dto.getComment());

        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            entity.setUser(user);
        }

        return entity;
    }
}

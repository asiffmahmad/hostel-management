package com.hostel.backend.mapper;

import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public StudentDTO toDto(Student entity) {
        if (entity == null) {
            return null;
        }

        StudentDTO dto = new StudentDTO();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setName(entity.getName());
        dto.setPhoto(entity.getPhoto());
        dto.setPhone(entity.getPhone());
        dto.setParentPhone(entity.getParentPhone());
        dto.setFatherName(entity.getFatherName());
        dto.setFatherPhone(entity.getFatherPhone());
        dto.setMotherName(entity.getMotherName());
        dto.setMotherPhone(entity.getMotherPhone());
        dto.setGuardianRelation(entity.getGuardianRelation());
        dto.setGuardianName(entity.getGuardianName());
        dto.setGuardianPhone(entity.getGuardianPhone());
        dto.setNotes(entity.getNotes());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setAadhaarNumber(entity.getAadhaarNumber());
        dto.setJoiningDate(entity.getJoiningDate());
        
        if (entity.getBed() != null) {
            dto.setBedId(entity.getBed().getId());
            if (entity.getBed().getRoom() != null) {
                dto.setRoomId(entity.getBed().getRoom().getId());
            }
        }
        
        if (entity.getHostel() != null) {
            dto.setHostelId(entity.getHostel().getId());
        }

        dto.setMonthlyRent(entity.getMonthlyRent());
        dto.setAdvanceDeposit(entity.getAdvanceDeposit());
        dto.setStatus(entity.getStatus());

        return dto;
    }

    public Student toEntity(StudentDTO dto) {
        if (dto == null) {
            return null;
        }

        Student entity = new Student();
        entity.setId(dto.getId());
        entity.setStudentId(dto.getStudentId());
        entity.setName(dto.getName());
        entity.setPhoto(dto.getPhoto());
        entity.setPhone(dto.getPhone());
        entity.setParentPhone(dto.getParentPhone());
        entity.setFatherName(dto.getFatherName());
        entity.setFatherPhone(dto.getFatherPhone());
        entity.setMotherName(dto.getMotherName());
        entity.setMotherPhone(dto.getMotherPhone());
        entity.setGuardianRelation(dto.getGuardianRelation());
        entity.setGuardianName(dto.getGuardianName());
        entity.setGuardianPhone(dto.getGuardianPhone());
        entity.setNotes(dto.getNotes());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
        entity.setAadhaarNumber(dto.getAadhaarNumber());
        entity.setJoiningDate(dto.getJoiningDate());
        
        if (dto.getBedId() != null) {
            Bed bed = new Bed();
            bed.setId(dto.getBedId());
            entity.setBed(bed);
        }

        if (dto.getHostelId() != null) {
            com.hostel.backend.entity.Hostel hostel = new com.hostel.backend.entity.Hostel();
            hostel.setId(dto.getHostelId());
            entity.setHostel(hostel);
        }

        entity.setMonthlyRent(dto.getMonthlyRent() != null ? dto.getMonthlyRent() : 0.0);
        entity.setAdvanceDeposit(dto.getAdvanceDeposit() != null ? dto.getAdvanceDeposit() : 0.0);
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        return entity;
    }
}

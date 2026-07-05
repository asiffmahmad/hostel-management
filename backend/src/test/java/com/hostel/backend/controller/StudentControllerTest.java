package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.HostelDTO;
import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    private Long testBedId;
    private Long testHostelId;

    @BeforeEach
    public void setup() {
        Hostel hostel = new Hostel();
        hostel.setName("Test Hostel Student Controller " + System.currentTimeMillis());
        hostel.setStatus(com.hostel.backend.enums.HostelStatus.ACTIVE);
        hostel = hostelRepository.save(hostel);
        testHostelId = hostel.getId();

        Room room = new Room();
        room.setRoomNumber("101-" + System.currentTimeMillis());
        room.setCapacity(2);
        room.setHostel(hostel);
        room = roomRepository.save(room);

        Bed bed = new Bed();
        bed.setBedNumber("101-A-" + System.currentTimeMillis());
        bed.setRoom(room);
        bed.setStatus(BedStatus.VACANT);
        bed = bedRepository.save(bed);
        
        testBedId = bed.getId();
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testStudentLifecycle_Positive() throws Exception {
        // 1. Create Student
        String uniqueStudentId = "ST-TEST-" + System.currentTimeMillis();
        String jsonPayload = String.format(
            "{\"studentId\":\"%s\",\"name\":\"John Doe\",\"phone\":\"1234567890\",\"bedId\":%d,\"monthlyRent\":5000.0,\"advanceDeposit\":10000.0,\"joiningDate\":\"2026-07-05\"}",
            uniqueStudentId, testBedId
        );

        MvcResult createResult = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.studentId").value(uniqueStudentId))
                .andReturn();

        String responseStr = createResult.getResponse().getContentAsString();
        // Simple regex to extract ID since we know the format
        Long studentId = Long.parseLong(responseStr.split("\"id\":")[1].split(",")[0]);

        // 2. Get All Students
        mockMvc.perform(get("/api/students?hostelId=" + testHostelId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 3. Get Student By ID
        mockMvc.perform(get("/api/students/" + studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));



        // 5. Delete Student (Will also clear bed assignment)
        mockMvc.perform(delete("/api/students/" + studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Student deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void createStudent_ValidationFailure_Negative() throws Exception {
        StudentDTO dto = new StudentDTO();
        // Missing required fields

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}

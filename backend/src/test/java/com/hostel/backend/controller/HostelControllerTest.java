package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.HostelDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HostelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @WithMockUser(roles = "OWNER")
    public void testHostelLifecycle_Positive() throws Exception {
        // 1. Create Hostel
        HostelDTO dto = new HostelDTO();
        dto.setName("Lifecycle Test Hostel");
        dto.setTotalBeds(100);
        dto.setStatus(com.hostel.backend.enums.HostelStatus.ACTIVE);

        MvcResult createResult = mockMvc.perform(post("/api/hostels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Lifecycle Test Hostel"))
                .andReturn();

        HostelDTO createdDto = objectMapper.readValue(createResult.getResponse().getContentAsString(), HostelDTO.class);
        Long hostelId = createdDto.getId();

        // 2. Get All Hostels
        mockMvc.perform(get("/api/hostels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 3. Get Hostel By ID
        mockMvc.perform(get("/api/hostels/" + hostelId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Lifecycle Test Hostel"));

        // 4. Update Hostel
        createdDto.setName("Updated Hostel");
        mockMvc.perform(put("/api/hostels/" + hostelId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createdDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Hostel"));

        // 5. Delete Hostel
        mockMvc.perform(delete("/api/hostels/" + hostelId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hostel deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void createHostel_ValidationFailure_Negative() throws Exception {
        HostelDTO dto = new HostelDTO();
        // Missing name, totalBeds, etc

        mockMvc.perform(post("/api/hostels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void getHostelById_NotFound_Negative() throws Exception {
        mockMvc.perform(get("/api/hostels/999999"))
                .andExpect(status().isNotFound()); // Or whatever your error handler returns
    }
}

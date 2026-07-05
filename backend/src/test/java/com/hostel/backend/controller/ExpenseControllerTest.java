package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.ExpenseDTO;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.enums.HostelStatus;
import com.hostel.backend.repository.ExpenseRepository;
import com.hostel.backend.repository.HostelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
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
public class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    private Long testHostelId;

    @BeforeEach
    public void setup() {
        if (hostelRepository.count() == 0) {
            Hostel hostel = new Hostel();
            hostel.setName("Test Hostel Expense");
            hostel.setStatus(HostelStatus.ACTIVE);
            hostel = hostelRepository.save(hostel);
            testHostelId = hostel.getId();
        } else {
            testHostelId = hostelRepository.findAll().get(0).getId();
        }
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExpenseLifecycle_Positive() throws Exception {
        // 1. Create Expense
        String jsonPayload = "{\"category\":\"ELECTRICITY\",\"amount\":1500.0,\"expenseDate\":\"2024-01-15\",\"description\":\"January Bill\",\"recordedBy\":1}";

        MvcResult createResult = mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.category").value("ELECTRICITY"))
                .andReturn();

        String responseStr = createResult.getResponse().getContentAsString();
        Long expenseId = Long.parseLong(responseStr.split("\"id\":")[1].split(",")[0]);

        // 2. Get All Expenses
        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 4. Get Expense By ID
        mockMvc.perform(get("/api/expenses/" + expenseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(1500.0));

        // 5. Update Expense
        String updateJson = String.format(
            "{\"id\":%d,\"category\":\"WATER\",\"amount\":800.0,\"expenseDate\":\"2024-01-16\",\"description\":\"Water Bill\",\"recordedBy\":1}",
            expenseId
        );
        mockMvc.perform(put("/api/expenses/" + expenseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("WATER"))
                .andExpect(jsonPath("$.amount").value(800.0));

        // 6. Delete Expense
        mockMvc.perform(delete("/api/expenses/" + expenseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Expense deleted successfully"));
    }
}

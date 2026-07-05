package com.hostel.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportStudentsCsv_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/students/csv"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportStudentsPdf_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/students/pdf"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportHostelsCsv_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/hostels/csv"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportHostelsPdf_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/hostels/pdf"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportPaymentsCsv_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/payments/csv"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testExportPaymentsPdf_Positive() throws Exception {
        mockMvc.perform(get("/api/reports/payments/pdf"))
                .andExpect(status().isOk());
    }
}

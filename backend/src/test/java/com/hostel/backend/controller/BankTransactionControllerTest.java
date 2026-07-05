package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.MapPaymentRequestDTO;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.repository.BankTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BankTransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BankTransactionRepository bankTransactionRepository;

    private Long testTransactionId;

    @BeforeEach
    public void setup() {
        if (bankTransactionRepository.count() == 0) {
            BankTransaction tx = new BankTransaction();
            tx.setTransactionDate(LocalDate.of(2026, 7, 1));
            tx.setReferenceNumber("TXN-12345");
            tx.setUtrNumber("UTR99999");
            tx.setAmount(new BigDecimal("5000.00"));
            tx.setTransactionType("CR");
            tx.setBankName("Test Bank");
            tx.setAccountNumber("1234567890");
            tx.setMonth("JULY");
            tx.setYear("2026");
            tx = bankTransactionRepository.save(tx);
            testTransactionId = tx.getId();
        } else {
            testTransactionId = bankTransactionRepository.findAll().get(0).getId();
        }
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testBankTransactionLifecycle_Positive() throws Exception {
        // 1. Get by Month
        mockMvc.perform(get("/api/bank/month?month=JULY&year=2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 2. Search by UTR
        mockMvc.perform(get("/api/bank/search?utrNumber=UTR99999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].utrNumber").value("UTR99999"));

        // 3. Get by ID
        mockMvc.perform(get("/api/bank/" + testTransactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utrNumber").value("UTR99999"));

        // 4. Delete by Month
        mockMvc.perform(delete("/api/bank/month/JULY/2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Transactions deleted for JULY/2026"));
    }
}

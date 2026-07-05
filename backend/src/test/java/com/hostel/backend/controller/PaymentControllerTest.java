package com.hostel.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostel.backend.dto.PaymentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import com.hostel.backend.entity.Student;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.HostelRepository;
import com.hostel.backend.repository.RoomRepository;
import com.hostel.backend.repository.StudentRepository;
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
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Long testStudentId;

    @BeforeEach
    public void setup() {
        if (studentRepository.count() == 0) {
            Hostel hostel = new Hostel();
            hostel.setName("Test Hostel Payment");
            hostel.setStatus(com.hostel.backend.enums.HostelStatus.ACTIVE);
            hostel = hostelRepository.save(hostel);

            Room room = new Room();
            room.setRoomNumber("201");
            room.setCapacity(1);
            room.setHostel(hostel);
            room = roomRepository.save(room);

            Bed bed = new Bed();
            bed.setBedNumber("201-A");
            bed.setRoom(room);
            bed.setStatus(BedStatus.OCCUPIED);
            bed = bedRepository.save(bed);

            Student student = new Student();
            student.setStudentId("ST-PAY-001");
            student.setName("Alice");
            student.setBed(bed);
            student.setPhone("1112223333");
            student = studentRepository.save(student);

            testStudentId = student.getId();
        } else {
            testStudentId = studentRepository.findAll().get(0).getId();
        }
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testPaymentLifecycle_Positive() throws Exception {
        // 1. Create Payment
        String jsonPayload = String.format(
            "{\"studentId\":%d,\"amount\":5000.0,\"month\":\"JANUARY\",\"year\":\"2024\",\"status\":\"PAID\",\"paymentMethod\":\"UPI\",\"utrNumber\":\"UTR12345\"}",
            testStudentId
        );

        MvcResult createResult = mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andReturn();

        String responseStr = createResult.getResponse().getContentAsString();
        Long paymentId = Long.parseLong(responseStr.split("\"id\":")[1].split(",")[0]);

        // 2. Get All Payments
        mockMvc.perform(get("/api/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 3. Get Payment By ID
        mockMvc.perform(get("/api/payments/" + paymentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utrNumber").value("UTR12345"));

        // 4. Update Payment
        String updateJson = String.format(
            "{\"id\":%d,\"studentId\":%d,\"amount\":6000.0,\"month\":\"JANUARY\",\"year\":\"2024\",\"status\":\"PAID\",\"paymentMethod\":\"UPI\",\"utrNumber\":\"UTR123456\"}",
            paymentId, testStudentId
        );
        mockMvc.perform(put("/api/payments/" + paymentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(6000.0))
                .andExpect(jsonPath("$.utrNumber").value("UTR123456"));

        // 5. Delete Payment
        mockMvc.perform(delete("/api/payments/" + paymentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Payment deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testGenerateMonthlyInvoices_Positive() throws Exception {
        mockMvc.perform(post("/api/payments/generate-monthly?month=FEBRUARY&year=2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Monthly invoices generated successfully"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    public void testSearchByUtr_Negative() throws Exception {
        mockMvc.perform(get("/api/payments/search?utrNumber=INVALID_UTR_999"))
                .andExpect(status().isOk()) // The controller maps empty to a 200 with a MessageResponse
                .andExpect(jsonPath("$.message").exists());
    }
}

package com.hostel.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class HealthControllerTest {

    @Test
    public void healthEndpoint_ShouldReturn200AndValidJson() {
        HealthController controller = new HealthController();
        ResponseEntity<Map<String, Object>> response = controller.checkHealth();
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
        assertThat(response.getBody().get("application")).isEqualTo("Hostel Management System");
        assertThat(response.getBody().get("version")).isEqualTo("1.0.0");
        assertThat(response.getBody().get("timestamp")).isNotNull();
    }
}

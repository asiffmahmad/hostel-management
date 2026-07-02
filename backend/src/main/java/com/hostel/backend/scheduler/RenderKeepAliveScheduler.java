package com.hostel.backend.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class RenderKeepAliveScheduler {

    private final RestTemplate restTemplate;

    public RenderKeepAliveScheduler() {
        this.restTemplate = new RestTemplate();
    }

    // Runs every 3 minutes (180,000 milliseconds)
    @Scheduled(fixedRate = 180000)
    public void pingRenderToKeepAwake() {
        String url = "https://hostel-management-9v50.onrender.com/api/health";
        try {
            log.info("Pinging Render to keep instance alive: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            log.info("Render keep-alive ping successful. Response: {}", response);
        } catch (Exception e) {
            log.error("Render keep-alive ping failed: {}", e.getMessage());
        }
    }
}

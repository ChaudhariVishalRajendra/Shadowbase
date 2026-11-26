package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.dto.HealthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        log.info("API Request: GET /api/v1/health");
        HealthResponse response = new HealthResponse(
            "UP",
            "ShadowBase Backend",
            "Backend is operational and ready for sandbox operations.",
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(response);
    }
}

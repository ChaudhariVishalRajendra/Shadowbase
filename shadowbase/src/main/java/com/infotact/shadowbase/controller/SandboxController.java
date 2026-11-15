package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.dto.SandboxResponse;
import com.infotact.shadowbase.dto.SandboxStartRequest;
import com.infotact.shadowbase.service.ContainerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * SandboxController - REST API for Docker Container Management
 * 
 * Powered by Lombok @Slf4j for controller request logging.
 */
@RestController
@RequestMapping("/api/v1/sandbox")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class SandboxController {

    private final ContainerService containerService;

    @Autowired
    public SandboxController(ContainerService containerService) {
        this.containerService = containerService;
    }

    /**
     * POST /api/v1/sandbox/start
     * Starts a new ephemeral MySQL container and seeds baseline schema.
     */
    @PostMapping("/start")
    public ResponseEntity<SandboxResponse> startSandbox(@RequestBody(required = false) SandboxStartRequest request) {
        String sessionName = (request != null && request.getSessionName() != null)
                ? request.getSessionName()
                : "Migration-Session";

        log.info("API Request: POST /api/v1/sandbox/start for session '{}'", sessionName);
        SandboxResponse response = containerService.startSandbox(sessionName);

        if ("FAILED".equals(response.getStatus())) {
            log.error("Failed to initialize sandbox for session '{}'", sessionName);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        log.info("Sandbox started successfully. Mapped Port: {}", response.getMappedPort());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/v1/sandbox/stop
     * Stops and destroys the active MySQL container.
     */
    @PostMapping("/stop")
    public ResponseEntity<SandboxResponse> stopSandbox() {
        log.info("API Request: POST /api/v1/sandbox/stop");
        SandboxResponse response = containerService.stopSandbox();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/sandbox/status
     * Gets current running status of the sandbox container.
     */
    @GetMapping("/status")
    public ResponseEntity<SandboxResponse> getStatus() {
        SandboxResponse response = containerService.getStatus();
        return ResponseEntity.ok(response);
    }
}

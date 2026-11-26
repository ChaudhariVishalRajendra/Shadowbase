package com.infotact.shadowbase.service;

import com.infotact.shadowbase.dto.SandboxResponse;
import com.infotact.shadowbase.entity.SandboxSession;
import com.infotact.shadowbase.repository.SandboxSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.testcontainers.containers.MySQLContainer;

import java.time.LocalDateTime;

@Service
@Slf4j
public class ContainerService {

    private final SandboxSessionRepository sessionRepository;

    private MySQLContainer<?> activeContainer;
    private SandboxSession currentSession;

    @Autowired
    public ContainerService(SandboxSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public SandboxResponse mapToResponseDto(SandboxSession session, String customMessage) {
        if (session == null) {
            return SandboxResponse.builder()
                    .sessionId(0L)
                    .sessionName("None")
                    .status("IDLE")
                    .containerId(null)
                    .mappedPort(null)
                    .message(customMessage != null ? customMessage : "No active session.")
                    .build();
        }

        return SandboxResponse.builder()
                .sessionId(session.getId() != null ? session.getId() : 0L)
                .sessionName(session.getSessionName())
                .status(session.getStatus())
                .containerId(session.getContainerId())
                .mappedPort(session.getMappedPort())
                .message(customMessage)
                .build();
    }

    public synchronized SandboxResponse startSandbox(String sessionName) {
        log.info("Starting new sandbox session: '{}'...", sessionName);

        if (activeContainer != null && activeContainer.isRunning()) {
            log.info("Stopping previously running container [{}]...", activeContainer.getContainerId());
            stopSandbox();
        }

        String safeSessionName = (sessionName != null && !sessionName.trim().isEmpty())
                ? sessionName
                : "Sandbox-Session-" + System.currentTimeMillis();

        SandboxSession session = SandboxSession.builder()
                .sessionName(safeSessionName)
                .status("INITIALIZING")
                .build();
        session = sessionRepository.save(session);
        this.currentSession = session;

        try {

            activeContainer = new MySQLContainer<>("mysql:8.0")
                    .withDatabaseName("sample_shop")
                    .withUsername("test")
                    .withPassword("test")
                    .withInitScript("db/init.sql");

            activeContainer.start();

            String containerId = activeContainer.getContainerId();
            Integer mappedPort = activeContainer.getFirstMappedPort();

            log.info("Docker container started! ContainerId: [{}], Mapped Port: [{}]", containerId, mappedPort);

            session.setContainerId(containerId);
            session.setMappedPort(mappedPort);
            session.setStatus("RUNNING");
            session = sessionRepository.save(session);
            this.currentSession = session;

            return mapToResponseDto(session, "Sandbox container started and seeded with baseline schema.");

        } catch (Exception ex) {
            log.error("Failed to start Testcontainers MySQL container: {}", ex.getMessage(), ex);
            session.setStatus("FAILED");
            session.setTerminatedAt(LocalDateTime.now());
            sessionRepository.save(session);

            return mapToResponseDto(session, "Error starting Docker container: " + ex.getMessage());
        }
    }

    public synchronized SandboxResponse stopSandbox() {
        if (activeContainer != null && activeContainer.isRunning()) {
            String containerId = activeContainer.getContainerId();
            log.info("Stopping container [{}]...", containerId);
            activeContainer.stop();
            activeContainer = null;

            if (currentSession != null) {
                currentSession.setStatus("STOPPED");
                currentSession.setTerminatedAt(LocalDateTime.now());
                currentSession = sessionRepository.save(currentSession);
            }

            return mapToResponseDto(currentSession, "Sandbox container stopped and cleaned up successfully.");
        }

        return mapToResponseDto(null, "No active container was running.");
    }

    public SandboxResponse getStatus() {
        boolean isRunning = (activeContainer != null && activeContainer.isRunning());
        if (isRunning && currentSession != null) {
            return mapToResponseDto(currentSession, "Sandbox is active and receiving traffic.");
        }

        return mapToResponseDto(null, "Sandbox is idle.");
    }

    public String getJdbcUrl() {
        return (activeContainer != null && activeContainer.isRunning()) ? activeContainer.getJdbcUrl() : null;
    }

    public String getUsername() {
        return (activeContainer != null && activeContainer.isRunning()) ? activeContainer.getUsername() : null;
    }

    public String getPassword() {
        return (activeContainer != null && activeContainer.isRunning()) ? activeContainer.getPassword() : null;
    }
}

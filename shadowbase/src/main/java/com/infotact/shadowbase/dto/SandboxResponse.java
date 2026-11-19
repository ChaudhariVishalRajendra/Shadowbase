package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SandboxResponse DTO
 * 
 * Powered by Lombok:
 * @Data provides getters & setters.
 * @Builder enables clean fluent object creation: SandboxResponse.builder()...build()
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SandboxResponse {

    private long sessionId;
    private String sessionName;
    private String status;      // e.g. "RUNNING", "STOPPED", "FAILED", "IDLE"
    private String containerId;
    private Integer mappedPort;
    private String message;
}

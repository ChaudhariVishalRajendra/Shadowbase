package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SandboxResponse {

    private long sessionId;
    private String sessionName;
    private String status;
    private String containerId;
    private Integer mappedPort;
    private String message;
}

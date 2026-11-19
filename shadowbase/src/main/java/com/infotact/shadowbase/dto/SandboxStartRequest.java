package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SandboxStartRequest DTO
 * 
 * Powered by Lombok:
 * @Data provides getters & setters.
 * @NoArgsConstructor provides default constructor for JSON deserialization.
 * @AllArgsConstructor provides parameterized constructor.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SandboxStartRequest {

    private String sessionName;
}

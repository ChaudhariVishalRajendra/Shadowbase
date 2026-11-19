package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HealthResponse DTO
 * 
 * Powered by Lombok:
 * @Data automatically generates getters, setters, toString, equals, and hashCode.
 * @NoArgsConstructor generates the default constructor.
 * @AllArgsConstructor generates the parameterized constructor.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {

    private String status;
    private String service;
    private String message;
    private long timestamp;
}

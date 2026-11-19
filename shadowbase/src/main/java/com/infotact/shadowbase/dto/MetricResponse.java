package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MetricResponse DTO
 * 
 * Represents real-time query replay statistics and error metrics
 * for an active or completed sandbox session.
 * Aligned with docs/API_Contracts.md.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricResponse {

    private Long sessionId;
    private Long totalQueriesReplayed;
    private Long totalErrors;
    private Double errorRatePercentage;
    private String status;
}

package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

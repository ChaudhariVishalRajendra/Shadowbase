package com.infotact.shadowbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MigrationApplyResponse {

    private Long migrationId;
    private Long sessionId;
    private String status;
    private Integer executionTimeMs;
    private String errorMessage;
    private List<String> warnings;
}

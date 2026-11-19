package com.infotact.shadowbase.service;

import com.infotact.shadowbase.dto.MetricResponse;
import com.infotact.shadowbase.entity.MetricSnapshot;
import com.infotact.shadowbase.entity.SandboxSession;
import com.infotact.shadowbase.repository.MetricSnapshotRepository;
import com.infotact.shadowbase.repository.SandboxSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class MetricService {

    private final MetricSnapshotRepository metricSnapshotRepository;
    private final SandboxSessionRepository sessionRepository;

    @Autowired
    public MetricService(MetricSnapshotRepository metricSnapshotRepository,
                         SandboxSessionRepository sessionRepository) {
        this.metricSnapshotRepository = metricSnapshotRepository;
        this.sessionRepository = sessionRepository;
    }

    // Fetches live/recorded metrics for a specific session ID
    public MetricResponse getMetricsForSession(Long sessionId) {
        log.info("Fetching metrics for session ID: {}", sessionId);

        Optional<MetricSnapshot> snapshotOpt = metricSnapshotRepository.findFirstBySessionIdOrderByIdDesc(sessionId);
        Optional<SandboxSession> sessionOpt = sessionRepository.findById(sessionId);

        String sessionStatus = sessionOpt.map(SandboxSession::getStatus).orElse("IDLE");

        if (snapshotOpt.isPresent()) {
            MetricSnapshot snapshot = snapshotOpt.get();
            long total = snapshot.getTotalReplayed() != null ? snapshot.getTotalReplayed() : 0L;
            long errors = snapshot.getTotalErrors() != null ? snapshot.getTotalErrors() : 0L;
            double errorRate = total > 0 ? ((double) errors / total) * 100.0 : 0.0;

            return MetricResponse.builder()
                    .sessionId(sessionId)
                    .totalQueriesReplayed(total)
                    .totalErrors(errors)
                    .errorRatePercentage(Math.round(errorRate * 100.0) / 100.0)
                    .status(sessionStatus)
                    .build();
        }

        // Clean initial baseline if session is running but no traffic replayed yet
        return MetricResponse.builder()
                .sessionId(sessionId)
                .totalQueriesReplayed(0L)
                .totalErrors(0L)
                .errorRatePercentage(0.0)
                .status(sessionStatus)
                .build();
    }

    // Fetches metrics for the most recent active session
    public MetricResponse getLatestMetrics() {
        Optional<SandboxSession> latestSession = sessionRepository.findFirstByOrderByIdDesc();

        if (latestSession.isPresent()) {
            return getMetricsForSession(latestSession.get().getId());
        }

        return MetricResponse.builder()
                .sessionId(0L)
                .totalQueriesReplayed(0L)
                .totalErrors(0L)
                .errorRatePercentage(0.0)
                .status("IDLE")
                .build();
    }
}

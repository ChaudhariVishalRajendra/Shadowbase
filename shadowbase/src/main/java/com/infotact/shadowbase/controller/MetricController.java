package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.dto.MetricResponse;
import com.infotact.shadowbase.service.MetricService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
@CrossOrigin(origins = "*")
@Slf4j
public class MetricController {

    private final MetricService metricService;

    @Autowired
    public MetricController(MetricService metricService) {
        this.metricService = metricService;
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<MetricResponse> getMetricsBySessionId(@PathVariable Long sessionId) {
        log.info("REST: Received request for metrics of session ID: {}", sessionId);
        MetricResponse response = metricService.getMetricsForSession(sessionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<MetricResponse> getLatestMetrics() {
        log.info("REST: Received request for latest metrics");
        MetricResponse response = metricService.getLatestMetrics();
        return ResponseEntity.ok(response);
    }
}

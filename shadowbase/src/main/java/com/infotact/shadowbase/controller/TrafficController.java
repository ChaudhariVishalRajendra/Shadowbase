package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.service.TrafficSimulationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/traffic")
@CrossOrigin(origins = "*")
@Slf4j
public class TrafficController {

    private final TrafficSimulationService trafficService;

    @Autowired
    public TrafficController(TrafficSimulationService trafficService) {
        this.trafficService = trafficService;
    }

    // POST /api/v1/traffic/seed - Seeds initial bulk customer and order records
    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedInitialData() {
        log.info("REST: Request to seed Mock MySQL with realistic data");
        Map<String, Object> result = trafficService.seedInitialData();
        return ResponseEntity.ok(result);
    }

    // POST /api/v1/traffic/simulate - Generates on-demand customer transactions
    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulateTraffic(@RequestParam(defaultValue = "10") int count) {
        log.info("REST: Simulating {} traffic transactions", count);
        Map<String, Object> result = trafficService.simulateTransactions(count);
        return ResponseEntity.ok(result);
    }

    // GET /api/v1/traffic/status - Gets live transaction counts from Mock MySQL
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTrafficStatus() {
        Map<String, Object> status = trafficService.getTrafficStatus();
        return ResponseEntity.ok(status);
    }
}

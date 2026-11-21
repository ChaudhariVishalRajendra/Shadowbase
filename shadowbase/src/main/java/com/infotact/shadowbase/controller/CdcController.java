package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.service.CdcService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cdc")
@CrossOrigin(origins = "*")
@Slf4j
public class CdcController {

    private final CdcService cdcService;

    @Autowired
    public CdcController(CdcService cdcService) {
        this.cdcService = cdcService;
    }

    // POST /api/v1/cdc/connector/register - Registers Debezium connector
    @PostMapping("/connector/register")
    public ResponseEntity<Map<String, Object>> registerConnector() {
        log.info("REST: Triggering Debezium connector registration");
        Map<String, Object> response = cdcService.registerConnector();
        return ResponseEntity.ok(response);
    }

    // GET /api/v1/cdc/connector/status - Fetches Debezium connector status
    @GetMapping("/connector/status")
    public ResponseEntity<Map<String, Object>> getConnectorStatus() {
        Map<String, Object> status = cdcService.getConnectorStatus();
        return ResponseEntity.ok(status);
    }

    // GET /api/v1/cdc/connector/config - Reads registered JSON configuration
    @GetMapping("/connector/config")
    public ResponseEntity<String> getConnectorConfig() {
        return ResponseEntity.ok(cdcService.getConnectorConfigJson());
    }

    // GET /api/v1/cdc/topics - Lists expected CDC topics for verification
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getCdcTopics() {
        return ResponseEntity.ok(List.of(
                "mockserver.sample_shop.customers",
                "mockserver.sample_shop.orders",
                "schema-changes.sample_shop"
        ));
    }
}

package com.infotact.shadowbase.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CdcService {

    private static final String DEBEZIUM_BASE_URL = "http://localhost:8083";
    private final RestTemplate restTemplate;

    public CdcService() {
        this.restTemplate = new RestTemplate();
    }

    public String getConnectorConfigJson() {
        try {
            ClassPathResource resource = new ClassPathResource("debezium/mysql-connector.json");
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("Failed to read debezium/mysql-connector.json: {}", e.getMessage());
            return "{}";
        }
    }

    public Map<String, Object> registerConnector() {
        String url = DEBEZIUM_BASE_URL + "/connectors";
        String configJson = getConnectorConfigJson();

        log.info("Registering Debezium connector via POST to {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(configJson, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Connector registered successfully.");
            result.put("data", response.getBody());
            return result;

        } catch (Exception e) {
            log.warn("Connector registration response: {}", e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Could not register connector (Check if Docker cluster is running or already registered): " + e.getMessage());
            return result;
        }
    }

    public Map<String, Object> getConnectorStatus() {
        String url = DEBEZIUM_BASE_URL + "/connectors/mock-mysql-connector/status";
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> result = new HashMap<>();
            result.put("connected", true);
            result.put("status", response.getBody());
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("connected", false);
            result.put("message", "Debezium connector is not active or cluster is offline.");
            return result;
        }
    }

    public List<Map<String, Object>> getSampleCdcEvents() {
        List<Map<String, Object>> events = new java.util.ArrayList<>();

        long now = System.currentTimeMillis();
        events.add(Map.of(
                "topic", "mockserver.sample_shop.customers",
                "op", "c",
                "table", "customers",
                "ts_ms", now,
                "after", Map.of("id", 101, "first_name", "Aarav", "last_name", "Sharma", "email", "aarav.sharma@example.com")
        ));
        events.add(Map.of(
                "topic", "mockserver.sample_shop.orders",
                "op", "c",
                "table", "orders",
                "ts_ms", now - 250,
                "after", Map.of("id", 204, "customer_id", 101, "amount", 1499.50, "status", "COMPLETED")
        ));
        return events;
    }
}

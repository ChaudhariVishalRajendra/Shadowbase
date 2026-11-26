package com.infotact.shadowbase.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@Slf4j
public class TrafficSimulationService {

    private static final String MOCK_MYSQL_URL = "jdbc:mysql://localhost:3307/sample_shop?allowPublicKeyRetrieval=true&useSSL=false";
    private static final String MOCK_USER = "root";
    private static final String MOCK_PASSWORD = "rootpassword";

    private final Random random = new Random();

    public Map<String, Object> seedInitialData() {
        log.info("Seeding Mock Production MySQL with realistic baseline data...");
        Map<String, Object> response = new HashMap<>();

        try {
            ClassPathResource resource = new ClassPathResource("db/mock_traffic_seed.sql");
            String sqlContent;
            try (InputStream is = resource.getInputStream()) {
                sqlContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

            try (Connection conn = DriverManager.getConnection(MOCK_MYSQL_URL, MOCK_USER, MOCK_PASSWORD);
                 Statement stmt = conn.createStatement()) {

                for (String query : sqlContent.split(";")) {
                    String trimmed = query.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--") && !trimmed.startsWith("USE")) {
                        stmt.execute(trimmed);
                    }
                }

                log.info("Initial mock production data seeded successfully!");
                response.put("success", true);
                response.put("message", "Mock MySQL seeded with realistic customer profiles & orders.");
                return response;
            }

        } catch (Exception e) {
            log.warn("Could not seed mock MySQL directly (Docker container may not be up on port 3307): {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Mock database on port 3307 not reachable: " + e.getMessage());
            return response;
        }
    }

    public Map<String, Object> simulateTransactions(int batchSize) {
        int safeCount = Math.min(Math.max(batchSize, 1), 50);
        log.info("Simulating {} transactions against Mock Production MySQL...", safeCount);

        Map<String, Object> response = new HashMap<>();
        int successful = 0;

        String[] firstNames = {"Aarav", "Diya", "Kabir", "Ananya", "Riya", "Vihaan", "Saanvi", "Ishaan", "Pooja", "Vikram"};
        String[] lastNames = {"Sharma", "Patel", "Verma", "Rao", "Gupta", "Singh", "Mehta", "Joshi", "Nair", "Iyer"};

        try (Connection conn = DriverManager.getConnection(MOCK_MYSQL_URL, MOCK_USER, MOCK_PASSWORD);
             Statement stmt = conn.createStatement()) {

            for (int i = 0; i < safeCount; i++) {
                String first = firstNames[random.nextInt(firstNames.length)];
                String last = lastNames[random.nextInt(lastNames.length)];
                String email = first.toLowerCase() + "." + last.toLowerCase() + System.currentTimeMillis() + "@example.com";

                String insertCust = String.format(
                        "INSERT INTO customers (first_name, last_name, email) VALUES ('%s', '%s', '%s')",
                        first, last, email);
                stmt.execute(insertCust);

                double amount = Math.round((50.0 + (random.nextDouble() * 5000.0)) * 100.0) / 100.0;
                String insertOrder = String.format(
                        "INSERT INTO orders (customer_id, amount, status) VALUES (LAST_INSERT_ID(), %.2f, 'COMPLETED')",
                        amount);
                stmt.execute(insertOrder);

                successful++;
            }

            log.info("Successfully executed {} transaction pairs into Mock MySQL!", successful);
            response.put("success", true);
            response.put("transactionsGenerated", successful * 2);
            response.put("message", "Generated " + (successful * 2) + " events in Mock MySQL (captured by Debezium into Kafka).");
            return response;

        } catch (Exception e) {
            log.warn("Simulation failed: {}", e.getMessage());
            response.put("success", false);
            response.put("transactionsGenerated", 0);
            response.put("message", "Could not connect to Mock MySQL on port 3307: " + e.getMessage());
            return response;
        }
    }

    public Map<String, Object> getTrafficStatus() {
        Map<String, Object> status = new HashMap<>();
        try (Connection conn = DriverManager.getConnection(MOCK_MYSQL_URL, MOCK_USER, MOCK_PASSWORD);
             Statement stmt = conn.createStatement()) {

            ResultSet rs1 = stmt.executeQuery("SELECT COUNT(*) FROM customers");
            long customerCount = rs1.next() ? rs1.getLong(1) : 0L;

            ResultSet rs2 = stmt.executeQuery("SELECT COUNT(*) FROM orders");
            long orderCount = rs2.next() ? rs2.getLong(1) : 0L;

            status.put("connected", true);
            status.put("totalCustomers", customerCount);
            status.put("totalOrders", orderCount);
            return status;

        } catch (Exception e) {
            status.put("connected", false);
            status.put("totalCustomers", 0L);
            status.put("totalOrders", 0L);
            status.put("message", "Mock MySQL not reachable: " + e.getMessage());
            return status;
        }
    }
}

package com.infotact.shadowbase.service;

import com.infotact.shadowbase.dto.MigrationApplyRequest;
import com.infotact.shadowbase.dto.MigrationApplyResponse;
import com.infotact.shadowbase.entity.MigrationRecord;
import com.infotact.shadowbase.repository.MigrationRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class MigrationService {

    private final ContainerService containerService;
    private final MigrationRecordRepository migrationRecordRepository;

    @Autowired
    public MigrationService(ContainerService containerService,
                            MigrationRecordRepository migrationRecordRepository) {
        this.containerService = containerService;
        this.migrationRecordRepository = migrationRecordRepository;
    }

    public MigrationApplyResponse applyMigration(MigrationApplyRequest request) {
        log.info("Applying SQL migration for session [{}]: {}", request.getSessionId(), request.getSql());

        String jdbcUrl = containerService.getJdbcUrl();
        if (jdbcUrl == null) {
            return MigrationApplyResponse.builder()
                    .migrationId(null)
                    .sessionId(request.getSessionId())
                    .status("FAILED")
                    .executionTimeMs(0)
                    .errorMessage("No active MySQL sandbox container is running. Click 'Launch Sandbox' first.")
                    .warnings(List.of())
                    .build();
        }

        List<String> warnings = analyzeRisk(request.getSql());
        long startTime = System.currentTimeMillis();

        try (Connection conn = DriverManager.getConnection(
                jdbcUrl,
                containerService.getUsername(),
                containerService.getPassword());
             Statement stmt = conn.createStatement()) {

            stmt.execute(request.getSql());
            int elapsedMs = (int) (System.currentTimeMillis() - startTime);

            MigrationRecord record = MigrationRecord.builder()
                    .sessionId(request.getSessionId() != null ? request.getSessionId() : 1L)
                    .rawSql(request.getSql())
                    .status("APPLIED")
                    .executionTimeMs(elapsedMs)
                    .build();

            record = migrationRecordRepository.save(record);
            log.info("Migration [ID: {}] applied successfully in {} ms", record.getId(), elapsedMs);

            return MigrationApplyResponse.builder()
                    .migrationId(record.getId())
                    .sessionId(record.getSessionId())
                    .status("APPLIED")
                    .executionTimeMs(elapsedMs)
                    .warnings(warnings)
                    .build();

        } catch (Exception ex) {
            int elapsedMs = (int) (System.currentTimeMillis() - startTime);
            log.error("Migration execution failed: {}", ex.getMessage());

            MigrationRecord record = MigrationRecord.builder()
                    .sessionId(request.getSessionId() != null ? request.getSessionId() : 1L)
                    .rawSql(request.getSql())
                    .status("FAILED")
                    .executionTimeMs(elapsedMs)
                    .errorMessage(ex.getMessage())
                    .build();

            record = migrationRecordRepository.save(record);

            return MigrationApplyResponse.builder()
                    .migrationId(record.getId())
                    .sessionId(record.getSessionId())
                    .status("FAILED")
                    .executionTimeMs(elapsedMs)
                    .errorMessage(ex.getMessage())
                    .warnings(warnings)
                    .build();
        }
    }

    public List<MigrationRecord> getHistory(Long sessionId) {
        return migrationRecordRepository.findBySessionIdOrderByIdDesc(sessionId);
    }

    private List<String> analyzeRisk(String sql) {
        List<String> warnings = new ArrayList<>();
        if (sql == null) return warnings;

        String lower = sql.toLowerCase();
        if (lower.contains("drop column")) {
            warnings.add("Destructive Schema Change: Dropping columns may cause inflight SELECT/INSERT queries to fail.");
        }
        if (lower.contains("drop table")) {
            warnings.add("Critical Schema Change: Dropping table invalidates all dependent queries and foreign keys.");
        }
        if (lower.contains("rename column")) {
            warnings.add("Compatibility Warning: Column renames require backward-compatible dual-write views.");
        }
        return warnings;
    }
}

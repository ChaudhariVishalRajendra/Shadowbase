package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.dto.MigrationApplyRequest;
import com.infotact.shadowbase.dto.MigrationApplyResponse;
import com.infotact.shadowbase.entity.MigrationRecord;
import com.infotact.shadowbase.service.MigrationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/migrations")
@CrossOrigin(origins = "*")
@Slf4j
public class MigrationController {

    private final MigrationService migrationService;

    @Autowired
    public MigrationController(MigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<MigrationApplyResponse> applyMigration(@RequestBody MigrationApplyRequest request) {
        log.info("REST: Received request to apply migration: {}", request.getSql());
        MigrationApplyResponse response = migrationService.applyMigration(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<MigrationRecord>> getHistory(@PathVariable Long sessionId) {
        List<MigrationRecord> history = migrationService.getHistory(sessionId);
        return ResponseEntity.ok(history);
    }
}

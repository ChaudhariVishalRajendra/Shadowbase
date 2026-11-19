package com.infotact.shadowbase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MigrationRecord Entity
 * 
 * Maps to the 'migration_record' table in shadowbase_admin database.
 * Stores migration scripts executed by the developer.
 */
@Entity
@Table(name = "migration_record")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MigrationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "raw_sql", nullable = false, columnDefinition = "TEXT")
    private String rawSql;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // "PENDING", "APPLIED", "FAILED"

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}


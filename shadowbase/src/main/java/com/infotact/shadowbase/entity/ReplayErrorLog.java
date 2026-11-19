package com.infotact.shadowbase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ReplayErrorLog Entity
 * 
 * Maps to the 'replay_error_log' table in shadowbase_admin database.
 * Stores SQL exceptions thrown by the shadow database during CDC replay.
 */
@Entity
@Table(name = "replay_error_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplayErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "target_table", nullable = false, length = 100)
    private String targetTable;

    @Column(name = "failed_operation", nullable = false, length = 20)
    private String failedOperation; // "INSERT", "UPDATE", "DELETE"

    @Column(name = "original_payload", columnDefinition = "TEXT")
    private String originalPayload;

    @Column(name = "sql_error_code", length = 50)
    private String sqlErrorCode; // e.g. "1054"

    @Column(name = "sql_exception_text", nullable = false, columnDefinition = "TEXT")
    private String sqlExceptionText;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;

    @PrePersist
    protected void onCreate() {
        this.occurredAt = LocalDateTime.now();
    }
}


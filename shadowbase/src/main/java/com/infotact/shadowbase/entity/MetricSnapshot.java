package com.infotact.shadowbase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MetricSnapshot Entity
 * 
 * Maps to the 'metric_snapshot' table in shadowbase_admin database.
 * Periodically stores replayed query counts and error totals for dashboard stats.
 */
@Entity
@Table(name = "metric_snapshot")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "total_replayed", nullable = false)
    private Long totalReplayed;

    @Column(name = "total_errors", nullable = false)
    private Long totalErrors;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
        if (this.totalReplayed == null) this.totalReplayed = 0L;
        if (this.totalErrors == null) this.totalErrors = 0L;
    }
}


package com.infotact.shadowbase.repository;

import com.infotact.shadowbase.entity.MetricSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MetricSnapshotRepository extends JpaRepository<MetricSnapshot, Long> {

    // Fetches the most recent metric snapshot for a given session
    Optional<MetricSnapshot> findFirstBySessionIdOrderByIdDesc(Long sessionId);

    // Fetches the most recent overall metric snapshot
    Optional<MetricSnapshot> findFirstByOrderByIdDesc();
}

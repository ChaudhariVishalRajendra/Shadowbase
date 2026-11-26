package com.infotact.shadowbase.repository;

import com.infotact.shadowbase.entity.MetricSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MetricSnapshotRepository extends JpaRepository<MetricSnapshot, Long> {

    Optional<MetricSnapshot> findFirstBySessionIdOrderByIdDesc(Long sessionId);

    Optional<MetricSnapshot> findFirstByOrderByIdDesc();
}

package com.infotact.shadowbase.repository;

import com.infotact.shadowbase.entity.MigrationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MigrationRecordRepository extends JpaRepository<MigrationRecord, Long> {

    List<MigrationRecord> findBySessionIdOrderByIdDesc(Long sessionId);
}

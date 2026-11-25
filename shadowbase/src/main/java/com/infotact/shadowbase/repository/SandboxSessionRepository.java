package com.infotact.shadowbase.repository;

import com.infotact.shadowbase.entity.SandboxSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SandboxSessionRepository extends JpaRepository<SandboxSession, Long> {

    Optional<SandboxSession> findFirstByOrderByIdDesc();
}

package com.causa.backend.repository;

import com.causa.backend.model.Trace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TraceRepository extends JpaRepository<Trace, String> {
    List<Trace> findTop50ByOrderByStartTimeDesc();
    List<Trace> findByStatusOrderByStartTimeDesc(Trace.TraceStatus status);
}

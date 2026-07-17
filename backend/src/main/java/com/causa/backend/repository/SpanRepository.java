package com.causa.backend.repository;

import com.causa.backend.model.Span;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpanRepository extends JpaRepository<Span, String> {
    List<Span> findByRequestIdOrderByStartTimeAsc(String requestId);
    List<Span> findByServiceOrderByStartTimeDesc(String service);
    List<Span> findTop500ByOrderByStartTimeDesc();
}

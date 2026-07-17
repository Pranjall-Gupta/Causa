package com.causa.backend.controller;

import com.causa.backend.dto.Diagnosis;
import com.causa.backend.model.Span;
import com.causa.backend.model.Trace;
import com.causa.backend.repository.SpanRepository;
import com.causa.backend.repository.TraceRepository;
import com.causa.backend.service.RootCauseEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traces")
public class TraceController {

    @Autowired private TraceRepository traceRepository;
    @Autowired private SpanRepository spanRepository;
    @Autowired private RootCauseEngine rootCauseEngine;

    @GetMapping
    public List<Trace> recentTraces() {
        return traceRepository.findTop50ByOrderByStartTimeDesc();
    }

    @GetMapping("/{requestId}")
    public List<Span> traceDetail(@PathVariable String requestId) {
        return spanRepository.findByRequestIdOrderByStartTimeAsc(requestId);
    }

    @GetMapping("/{requestId}/diagnosis")
    public Diagnosis diagnose(@PathVariable String requestId) {
        return rootCauseEngine.diagnose(requestId);
    }
}

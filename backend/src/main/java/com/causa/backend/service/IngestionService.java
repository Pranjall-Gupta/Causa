package com.causa.backend.service;

import com.causa.backend.dto.SpanIngestDto;
import com.causa.backend.model.Span;
import com.causa.backend.model.Trace;
import com.causa.backend.repository.SpanRepository;
import com.causa.backend.repository.TraceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Ingestion path for spans reported by a real CAUSA agent running inside an
 * actual service (as opposed to SimulationEngine, which fabricates both the
 * spans and the trace in one shot).
 *
 * Real spans arrive incrementally - each service reports its own subtree
 * whenever it finishes handling its part of the request, independently of
 * when other services in the same trace finish theirs. So instead of writing
 * a Trace once with a known final status, this upserts the Trace on every
 * batch: widen the time range, flip to FAILED the moment any span reports an
 * error, and re-run the RCA engine so the diagnosis stays current as more
 * data arrives.
 */
@Service
public class IngestionService {

    @Autowired private SpanRepository spanRepository;
    @Autowired private TraceRepository traceRepository;
    @Autowired private RootCauseEngine rootCauseEngine;

    private static final long DEGRADED_THRESHOLD_MS = 800;

    public void ingest(List<SpanIngestDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;

        for (SpanIngestDto dto : dtos) {
            if (dto.spanId == null || dto.requestId == null) continue; // malformed, skip
            spanRepository.save(toEntity(dto));
        }

        // Group by requestId so a mixed batch (rare, but possible) updates every trace it touches
        dtos.stream().map(d -> d.requestId).distinct().forEach(this::reconcileTrace);
    }

    private Span toEntity(SpanIngestDto dto) {
        Span span = new Span();
        span.setSpanId(dto.spanId);
        span.setRequestId(dto.requestId);
        span.setParentSpanId(dto.parentSpanId);
        span.setService(dto.service != null ? dto.service : "unknown-service");
        span.setOperation(dto.operation != null ? dto.operation : "unknown");
        span.setLayer(parseLayer(dto.layer));

        Instant start = parseInstant(dto.startTime);
        Instant end = parseInstant(dto.endTime);
        span.setStartTime(start);
        span.setEndTime(end);
        if (start != null && end != null) {
            span.setDurationMs(end.toEpochMilli() - start.toEpochMilli());
        }

        span.setStatus("ERROR".equalsIgnoreCase(dto.status) ? Span.SpanStatus.ERROR : Span.SpanStatus.OK);
        span.setErrorMessage(dto.errorMessage);
        return span;
    }

    private void reconcileTrace(String requestId) {
        List<Span> spans = spanRepository.findByRequestIdOrderByStartTimeAsc(requestId);
        if (spans.isEmpty()) return;

        Trace trace = traceRepository.findById(requestId).orElseGet(() -> new Trace(requestId, null, "LIVE"));

        Instant earliestStart = spans.stream().map(Span::getStartTime).filter(java.util.Objects::nonNull)
                .min(Instant::compareTo).orElse(null);
        Instant latestEnd = spans.stream().map(Span::getEndTime).filter(java.util.Objects::nonNull)
                .max(Instant::compareTo).orElse(null);

        Span rootSpan = spans.stream().filter(s -> s.getParentSpanId() == null).findFirst().orElse(spans.get(0));
        if (trace.getEntryPoint() == null) {
            trace.setEntryPoint(rootSpan.getOperation());
        }
        trace.setStartTime(earliestStart);
        trace.setEndTime(latestEnd);
        if (earliestStart != null && latestEnd != null) {
            trace.setTotalDurationMs(latestEnd.toEpochMilli() - earliestStart.toEpochMilli());
        }

        boolean anyError = spans.stream().anyMatch(s -> s.getStatus() == Span.SpanStatus.ERROR);
        boolean slow = trace.getTotalDurationMs() != null && trace.getTotalDurationMs() > DEGRADED_THRESHOLD_MS;
        if (anyError) {
            trace.setStatus(Trace.TraceStatus.FAILED);
        } else if (slow) {
            trace.setStatus(Trace.TraceStatus.DEGRADED);
        } else {
            trace.setStatus(Trace.TraceStatus.SUCCESS);
        }

        traceRepository.save(trace);

        if (trace.getStatus() != Trace.TraceStatus.SUCCESS) {
            rootCauseEngine.diagnose(requestId);
        }
    }

    private Span.Layer parseLayer(String layer) {
        if (layer == null) return Span.Layer.BACKEND;
        try {
            return Span.Layer.valueOf(layer.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Span.Layer.BACKEND;
        }
    }

    private Instant parseInstant(String iso) {
        if (iso == null) return null;
        try {
            return Instant.parse(iso);
        } catch (Exception e) {
            return null;
        }
    }
}

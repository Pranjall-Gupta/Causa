package com.causa.agent;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Buffers finished spans in memory and periodically POSTs them to the CAUSA
 * backend's /api/spans/batch endpoint on a background thread, so recording
 * a span never blocks the request thread it was measured on.
 *
 * This is intentionally simple (no retry queue, no persistence, no
 * backpressure handling) - it's the MVP fire-and-forget version. If the
 * backend is down, spans for that window are dropped and logged, not
 * queued indefinitely.
 */
public class CausaSpanCollector {

    private final CausaProperties properties;
    private final ConcurrentLinkedQueue<CausaSpanRecord> buffer = new ConcurrentLinkedQueue<>();
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "causa-agent-flush");
        t.setDaemon(true);
        return t;
    });

    public CausaSpanCollector(CausaProperties properties) {
        this.properties = properties;
        scheduler.scheduleAtFixedRate(this::flush, properties.getFlushIntervalMs(),
                properties.getFlushIntervalMs(), TimeUnit.MILLISECONDS);
    }

    public void record(CausaSpanRecord span) {
        if (!properties.isEnabled()) return;
        buffer.add(span);
    }

    public void flush() {
        if (buffer.isEmpty()) return;
        List<CausaSpanRecord> batch = new ArrayList<>();
        CausaSpanRecord s;
        while ((s = buffer.poll()) != null) batch.add(s);
        if (batch.isEmpty()) return;

        try {
            List<Object> payload = batch.stream().map(this::toWireFormat).toList();
            String json = mapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getEndpoint() + "/api/spans/batch"))
                    .timeout(Duration.ofSeconds(3))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .exceptionally(ex -> {
                        System.err.println("[causa-agent] failed to reach CAUSA backend at "
                                + properties.getEndpoint() + ": " + ex.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            System.err.println("[causa-agent] failed to flush spans: " + e.getMessage());
        }
    }

    public void shutdown() {
        flush();
        scheduler.shutdown();
    }

    private Object toWireFormat(CausaSpanRecord s) {
        return new java.util.LinkedHashMap<String, Object>() {{
            put("spanId", s.spanId);
            put("requestId", s.requestId);
            put("parentSpanId", s.parentSpanId);
            put("service", s.service);
            put("layer", s.layer);
            put("operation", s.operation);
            put("startTime", s.startTime != null ? s.startTime.toString() : null);
            put("endTime", s.endTime != null ? s.endTime.toString() : null);
            put("status", s.status);
            put("errorMessage", s.errorMessage);
        }};
    }
}

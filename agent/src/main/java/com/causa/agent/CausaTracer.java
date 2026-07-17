package com.causa.agent;

import java.time.Instant;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Manual instrumentation API for anything the automatic HTTP filter/interceptor
 * can't see - most importantly database calls, which don't go through Spring's
 * servlet or RestTemplate layers.
 *
 * Usage:
 * <pre>
 *   Order order = causaTracer.trace("database", "INSERT INTO orders", () -> {
 *       return orderRepository.save(order);
 *   });
 * </pre>
 * If the supplier throws, the span is recorded as ERROR with the exception
 * message and the exception is rethrown unchanged.
 */
public class CausaTracer {

    private final CausaProperties properties;
    private final CausaSpanCollector collector;

    public CausaTracer(CausaProperties properties, CausaSpanCollector collector) {
        this.properties = properties;
        this.collector = collector;
    }

    public <T> T trace(String layerOrService, String operation, Supplier<T> action) {
        CausaTraceContext.Frame frame = CausaTraceContext.current();
        if (frame == null) {
            // No active request context (e.g. a scheduled job) - just run it, nothing to attach the span to.
            return action.get();
        }

        String spanId = UUID.randomUUID().toString();
        Instant start = Instant.now();
        CausaSpanRecord record = new CausaSpanRecord(
                spanId, frame.traceId, frame.currentSpanId,
                properties.getServiceName(), inferLayer(layerOrService), operation, start);

        // nested manual spans become children of this one for the duration of the call
        CausaTraceContext.set(frame.traceId, spanId);
        try {
            T result = action.get();
            record.endTime = Instant.now();
            record.status = "OK";
            collector.record(record);
            return result;
        } catch (RuntimeException e) {
            record.endTime = Instant.now();
            record.status = "ERROR";
            record.errorMessage = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            collector.record(record);
            throw e;
        } finally {
            CausaTraceContext.set(frame.traceId, frame.currentSpanId); // restore parent frame
        }
    }

    /** Void variant of trace() for calls that don't return a value. */
    public void traceVoid(String layerOrService, String operation, Runnable action) {
        trace(layerOrService, operation, () -> {
            action.run();
            return null;
        });
    }

    private String inferLayer(String layerOrService) {
        String lower = layerOrService.toLowerCase();
        if (lower.contains("db") || lower.contains("database") || lower.contains("sql") || lower.contains("repo")) {
            return "DB";
        }
        return "BACKEND";
    }
}

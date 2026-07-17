package com.causa.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * A single unit of work within a request's execution — one hop through one
 * service/layer. A Trace is a tree of Spans linked by parentSpanId.
 * Modeled loosely on the OpenTelemetry span concept, referenced in the
 * project's SRS (3.1.5 References -> distributed tracing frameworks).
 */
@Entity
@Table(name = "spans")
public class Span {

    @Id
    private String spanId;

    @Column(nullable = false)
    private String requestId;

    private String parentSpanId; // null => root span

    @Column(nullable = false)
    private String service;      // e.g. api-gateway, auth-service, order-service, payment-service, database

    @Enumerated(EnumType.STRING)
    private Layer layer;         // FRONTEND, BACKEND, DB

    private String operation;    // e.g. "POST /login", "SELECT users", "chargeCard"

    private Instant startTime;
    private Instant endTime;
    private Long durationMs;

    @Enumerated(EnumType.STRING)
    private SpanStatus status;   // OK, ERROR

    @Column(length = 2000)
    private String errorMessage;

    public Span() {}

    public Span(String spanId, String requestId, String parentSpanId, String service,
                Layer layer, String operation) {
        this.spanId = spanId;
        this.requestId = requestId;
        this.parentSpanId = parentSpanId;
        this.service = service;
        this.layer = layer;
        this.operation = operation;
        this.status = SpanStatus.OK;
    }

    public void finish(Instant end, SpanStatus status, String errorMessage) {
        this.endTime = end;
        this.status = status;
        this.errorMessage = errorMessage;
        if (this.startTime != null) {
            this.durationMs = end.toEpochMilli() - this.startTime.toEpochMilli();
        }
    }

    public enum Layer { FRONTEND, BACKEND, DB }
    public enum SpanStatus { OK, ERROR }

    // --- getters / setters ---
    public String getSpanId() { return spanId; }
    public void setSpanId(String spanId) { this.spanId = spanId; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getParentSpanId() { return parentSpanId; }
    public void setParentSpanId(String parentSpanId) { this.parentSpanId = parentSpanId; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public Layer getLayer() { return layer; }
    public void setLayer(Layer layer) { this.layer = layer; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public SpanStatus getStatus() { return status; }
    public void setStatus(SpanStatus status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

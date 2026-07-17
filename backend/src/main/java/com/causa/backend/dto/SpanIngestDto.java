package com.causa.backend.dto;

/**
 * Wire format for spans arriving from an external CAUSA agent (a real
 * instrumented service), as opposed to Span, which is the JPA entity.
 * Kept separate so the ingestion contract can evolve independently of
 * internal storage.
 */
public class SpanIngestDto {
    public String spanId;
    public String requestId;
    public String parentSpanId; // null/absent => this is the entry span for this hop
    public String service;
    public String layer;        // FRONTEND | BACKEND | DB (defaults to BACKEND if omitted/unrecognized)
    public String operation;
    public String startTime;    // ISO-8601 instant
    public String endTime;      // ISO-8601 instant
    public String status;       // OK | ERROR (defaults to OK)
    public String errorMessage;
}

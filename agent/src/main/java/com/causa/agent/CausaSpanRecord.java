package com.causa.agent;

import java.time.Instant;

public class CausaSpanRecord {
    public String spanId;
    public String requestId;
    public String parentSpanId;
    public String service;
    public String layer;
    public String operation;
    public Instant startTime;
    public Instant endTime;
    public String status = "OK";
    public String errorMessage;

    public CausaSpanRecord(String spanId, String requestId, String parentSpanId,
                            String service, String layer, String operation, Instant startTime) {
        this.spanId = spanId;
        this.requestId = requestId;
        this.parentSpanId = parentSpanId;
        this.service = service;
        this.layer = layer;
        this.operation = operation;
        this.startTime = startTime;
    }
}

package com.causa.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * One end-to-end request flowing through the system (frontend -> backend -> db).
 * A Trace is the parent record; its Spans are fetched separately by requestId.
 */
@Entity
@Table(name = "traces")
public class Trace {

    @Id
    private String requestId;

    private String entryPoint;      // e.g. "POST /login", "POST /checkout"
    private String scenario;        // which simulated scenario produced this trace

    @Enumerated(EnumType.STRING)
    private TraceStatus status;     // SUCCESS, FAILED, DEGRADED

    private Instant startTime;
    private Instant endTime;
    private Long totalDurationMs;

    private String rootCauseService; // filled in once the RCA engine has run, null otherwise
    private Double rootCauseConfidence;

    public Trace() {}

    public Trace(String requestId, String entryPoint, String scenario) {
        this.requestId = requestId;
        this.entryPoint = entryPoint;
        this.scenario = scenario;
        this.status = TraceStatus.SUCCESS;
        this.startTime = Instant.now();
    }

    public enum TraceStatus { SUCCESS, FAILED, DEGRADED }

    // --- getters / setters ---
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getEntryPoint() { return entryPoint; }
    public void setEntryPoint(String entryPoint) { this.entryPoint = entryPoint; }
    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }
    public TraceStatus getStatus() { return status; }
    public void setStatus(TraceStatus status) { this.status = status; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public Long getTotalDurationMs() { return totalDurationMs; }
    public void setTotalDurationMs(Long totalDurationMs) { this.totalDurationMs = totalDurationMs; }
    public String getRootCauseService() { return rootCauseService; }
    public void setRootCauseService(String rootCauseService) { this.rootCauseService = rootCauseService; }
    public Double getRootCauseConfidence() { return rootCauseConfidence; }
    public void setRootCauseConfidence(Double rootCauseConfidence) { this.rootCauseConfidence = rootCauseConfidence; }
}

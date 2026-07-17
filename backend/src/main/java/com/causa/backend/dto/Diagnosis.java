package com.causa.backend.dto;

import java.util.List;

/**
 * Output of the RootCauseEngine for a single trace: the service judged most
 * responsible, a confidence score, the propagation path that led there, and
 * a plain-English explanation (interpretability is a stated goal in the
 * project report - chapter 1.4, User-Centered Design Model).
 */
public class Diagnosis {
    private String requestId;
    private String rootCauseService;
    private String rootCauseOperation;
    private double confidence;         // 0.0 - 1.0
    private String explanation;
    private List<String> propagationPath; // ordered list of services the failure passed through
    private List<SpanScore> spanScores;   // every span considered, for transparency

    public static class SpanScore {
        public String service;
        public String operation;
        public double score;
        public String reason;

        public SpanScore(String service, String operation, double score, String reason) {
            this.service = service;
            this.operation = operation;
            this.score = score;
            this.reason = reason;
        }
    }

    public Diagnosis() {}

    // --- getters / setters ---
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getRootCauseService() { return rootCauseService; }
    public void setRootCauseService(String rootCauseService) { this.rootCauseService = rootCauseService; }
    public String getRootCauseOperation() { return rootCauseOperation; }
    public void setRootCauseOperation(String rootCauseOperation) { this.rootCauseOperation = rootCauseOperation; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public List<String> getPropagationPath() { return propagationPath; }
    public void setPropagationPath(List<String> propagationPath) { this.propagationPath = propagationPath; }
    public List<SpanScore> getSpanScores() { return spanScores; }
    public void setSpanScores(List<SpanScore> spanScores) { this.spanScores = spanScores; }
}

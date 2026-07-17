package com.causa.backend.dto;

import java.util.List;

public class DashboardSummary {
    private double avgLatencyMs;
    private double errorRatePercent;
    private long totalRequests;
    private double systemHealthIndex; // 0-100, matches the "Environmental Quality Index" style stat card
    private List<TimeBucket> timeline;  // for the bar chart
    private List<ServiceHealth> services; // for the table
    private List<String> serviceFlowOrder; // services in observed call order, for the flow widget
    private double latencyTrendPercent;   // vs "last period", positive = worse
    private double errorTrendPercent;
    private double healthTrendPercent;

    public static class TimeBucket {
        public String label;      // e.g. "10:32"
        public double value;      // e.g. anomaly index for that bucket
        public boolean anomaly;
        public TimeBucket(String label, double value, boolean anomaly) {
            this.label = label; this.value = value; this.anomaly = anomaly;
        }
    }

    public static class ServiceHealth {
        public String service;
        public String layer;
        public long requestCount;
        public double successRatePercent;
        public String trend;          // "up" | "down" | "flat"
        public String dominantIssue;  // most common failure type, or "Healthy"
        public double avgLatencyMs;
        public ServiceHealth(String service, String layer, long requestCount, double successRatePercent,
                              String trend, String dominantIssue, double avgLatencyMs) {
            this.service = service; this.layer = layer; this.requestCount = requestCount;
            this.successRatePercent = successRatePercent; this.trend = trend;
            this.dominantIssue = dominantIssue; this.avgLatencyMs = avgLatencyMs;
        }
    }

    // --- getters / setters ---
    public double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }
    public double getErrorRatePercent() { return errorRatePercent; }
    public void setErrorRatePercent(double errorRatePercent) { this.errorRatePercent = errorRatePercent; }
    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
    public double getSystemHealthIndex() { return systemHealthIndex; }
    public void setSystemHealthIndex(double systemHealthIndex) { this.systemHealthIndex = systemHealthIndex; }
    public List<TimeBucket> getTimeline() { return timeline; }
    public void setTimeline(List<TimeBucket> timeline) { this.timeline = timeline; }
    public List<ServiceHealth> getServices() { return services; }
    public void setServices(List<ServiceHealth> services) { this.services = services; }
    public List<String> getServiceFlowOrder() { return serviceFlowOrder; }
    public void setServiceFlowOrder(List<String> serviceFlowOrder) { this.serviceFlowOrder = serviceFlowOrder; }
    public double getLatencyTrendPercent() { return latencyTrendPercent; }
    public void setLatencyTrendPercent(double latencyTrendPercent) { this.latencyTrendPercent = latencyTrendPercent; }
    public double getErrorTrendPercent() { return errorTrendPercent; }
    public void setErrorTrendPercent(double errorTrendPercent) { this.errorTrendPercent = errorTrendPercent; }
    public double getHealthTrendPercent() { return healthTrendPercent; }
    public void setHealthTrendPercent(double healthTrendPercent) { this.healthTrendPercent = healthTrendPercent; }
}

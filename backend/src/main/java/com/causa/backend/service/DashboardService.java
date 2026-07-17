package com.causa.backend.service;

import com.causa.backend.dto.DashboardSummary;
import com.causa.backend.model.Span;
import com.causa.backend.model.Trace;
import com.causa.backend.repository.SpanRepository;
import com.causa.backend.repository.TraceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/** Turns raw traces/spans into the aggregate numbers the dashboard renders. */
@Service
public class DashboardService {

    @Autowired private TraceRepository traceRepository;
    @Autowired private SpanRepository spanRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public DashboardSummary getSummary() {
        List<Trace> traces = traceRepository.findTop50ByOrderByStartTimeDesc();
        DashboardSummary summary = new DashboardSummary();

        if (traces.isEmpty()) {
            summary.setTimeline(List.of());
            summary.setServices(List.of());
            summary.setServiceFlowOrder(List.of());
            return summary;
        }

        long total = traces.size();
        long failed = traces.stream().filter(t -> t.getStatus() == Trace.TraceStatus.FAILED).count();
        long degraded = traces.stream().filter(t -> t.getStatus() == Trace.TraceStatus.DEGRADED).count();
        double avgLatency = traces.stream()
                .filter(t -> t.getTotalDurationMs() != null)
                .mapToLong(Trace::getTotalDurationMs).average().orElse(0);
        double errorRate = 100.0 * failed / total;
        double healthIndex = Math.max(0, 100 - (errorRate * 1.2) - (degraded * 100.0 / total * 0.5));

        summary.setTotalRequests(total);
        summary.setAvgLatencyMs(round(avgLatency));
        summary.setErrorRatePercent(round(errorRate));
        summary.setSystemHealthIndex(round(healthIndex));

        // simple trend: compare first half vs second half of the window
        List<Trace> ordered = new ArrayList<>(traces);
        Collections.reverse(ordered); // oldest first
        int mid = ordered.size() / 2;
        summary.setLatencyTrendPercent(trend(
                avgOf(ordered.subList(0, Math.max(1, mid))),
                avgOf(ordered.subList(Math.max(1, mid), ordered.size()))));
        summary.setErrorTrendPercent(round((failed > 0 ? 1 : -1) * Math.min(15, failed * 1.5)));
        summary.setHealthTrendPercent(round(-summary.getErrorTrendPercent() * 0.6));

        // timeline: chronological anomaly index per trace (used by the "Failure Timeline" bar chart)
        List<DashboardSummary.TimeBucket> timeline = ordered.stream().map(t -> {
            double idx = t.getStatus() == Trace.TraceStatus.SUCCESS
                    ? 10 + new Random(t.getRequestId().hashCode()).nextInt(15)
                    : (t.getStatus() == Trace.TraceStatus.DEGRADED ? 55 + new Random().nextInt(20) : 75 + new Random().nextInt(25));
            String label = t.getStartTime() != null
                    ? TIME_FMT.format(t.getStartTime().atZone(ZoneId.systemDefault()))
                    : "";
            return new DashboardSummary.TimeBucket(label, idx, t.getStatus() != Trace.TraceStatus.SUCCESS);
        }).collect(Collectors.toList());
        summary.setTimeline(timeline);

        // per-service breakdown (for the table)
        Map<String, List<Span>> byService = spanRepository.findTop500ByOrderByStartTimeDesc()
                .stream().collect(Collectors.groupingBy(Span::getService));

        List<DashboardSummary.ServiceHealth> services = byService.entrySet().stream().map(e -> {
            String service = e.getKey();
            List<Span> spans = e.getValue();
            long count = spans.size();
            long errors = spans.stream().filter(s -> s.getStatus() == Span.SpanStatus.ERROR).count();
            double successRate = count == 0 ? 100 : round(100.0 * (count - errors) / count);
            double avgLat = spans.stream().filter(s -> s.getDurationMs() != null)
                    .mapToLong(Span::getDurationMs).average().orElse(0);
            String layer = spans.get(0).getLayer() != null ? spans.get(0).getLayer().name() : "BACKEND";
            String dominantIssue = spans.stream()
                    .filter(s -> s.getStatus() == Span.SpanStatus.ERROR && s.getErrorMessage() != null)
                    .map(s -> classify(s.getErrorMessage()))
                    .collect(Collectors.groupingBy(x -> x, Collectors.counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("Healthy");
            String trend = errors == 0 ? "flat" : (successRate < 80 ? "down" : "up");
            return new DashboardSummary.ServiceHealth(service, layer, count, successRate, trend, dominantIssue, round(avgLat));
        }).sorted((a, b) -> Long.compare(b.requestCount, a.requestCount)).collect(Collectors.toList());

        summary.setServices(services);
        summary.setServiceFlowOrder(computeFlowOrder(traces, services));
        return summary;
    }

    /**
     * Derives call order from real data instead of a hardcoded list: walks the
     * spans of the most recent trace that has more than one service involved,
     * in start-time order, keeping first occurrence of each service. Falls
     * back to request-count order if no multi-service trace is available yet.
     */
    private List<String> computeFlowOrder(List<Trace> traces, List<DashboardSummary.ServiceHealth> services) {
        for (Trace t : traces) {
            List<Span> spans = spanRepository.findByRequestIdOrderByStartTimeAsc(t.getRequestId());
            LinkedHashSet<String> order = new LinkedHashSet<>();
            for (Span s : spans) order.add(s.getService());
            if (order.size() > 1) return new ArrayList<>(order);
        }
        return services.stream().map(s -> s.service).collect(Collectors.toList());
    }

    private String classify(String errorMessage) {
        String m = errorMessage.toLowerCase();
        if (m.contains("timeout")) return "Timeout";
        if (m.contains("401") || m.contains("unauthorized")) return "Auth Failure";
        if (m.contains("502") || m.contains("gateway")) return "Upstream Error";
        if (m.contains("cascad") || m.contains("reset")) return "Cascading Failure";
        return "Error";
    }

    private double avgOf(List<Trace> traces) {
        return traces.stream().filter(t -> t.getTotalDurationMs() != null)
                .mapToLong(Trace::getTotalDurationMs).average().orElse(0);
    }

    private double trend(double before, double after) {
        if (before == 0) return 0;
        return round(((after - before) / before) * 100);
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}

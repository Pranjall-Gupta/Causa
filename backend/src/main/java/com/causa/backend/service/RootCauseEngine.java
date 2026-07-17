package com.causa.backend.service;

import com.causa.backend.dto.Diagnosis;
import com.causa.backend.model.Span;
import com.causa.backend.model.Trace;
import com.causa.backend.repository.SpanRepository;
import com.causa.backend.repository.TraceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Heuristic / rule-based root cause localization engine.
 *
 * This is the MVP substitute for the causal-graph / ML approach discussed in
 * the literature survey (2.3, 2.4, 2.10). Instead of learning a causal graph,
 * it scores every span in a trace against three explainable signals and picks
 * the highest scorer as the root cause:
 *
 *   1. ERROR PRESENCE (weight 0.5)
 *        A span that itself failed is far more likely to be a cause than one
 *        that merely observed a downstream failure.
 *
 *   2. ORIGIN-OF-FAILURE (weight 0.3)
 *        Among failing spans, the one whose children are ALL healthy (i.e. it
 *        has no failing descendant) is the deepest point of failure -
 *        everything above it in the tree is just propagation, not cause.
 *
 *   3. LATENCY CONTRIBUTION (weight 0.2)
 *        durationMs / totalTraceDuration. Catches cases with no hard error at
 *        all (the HIGH_LATENCY scenario) where one span simply dominates the
 *        total request time.
 *
 * Score is capped at 1.0 and reported directly as the confidence value, which
 * keeps the reasoning fully transparent - every span's score + the reason it
 * got that score is returned alongside the verdict (see Diagnosis.spanScores).
 */
@Service
public class RootCauseEngine {

    @Autowired private SpanRepository spanRepository;
    @Autowired private TraceRepository traceRepository;

    private static final double W_ERROR = 0.5;
    private static final double W_ORIGIN = 0.3;
    private static final double W_LATENCY = 0.2;

    public Diagnosis diagnose(String requestId) {
        List<Span> spans = spanRepository.findByRequestIdOrderByStartTimeAsc(requestId);
        Trace trace = traceRepository.findById(requestId).orElse(null);
        if (spans.isEmpty() || trace == null) {
            throw new NoSuchElementException("No trace found for requestId: " + requestId);
        }

        Map<String, List<Span>> childrenByParent = new HashMap<>();
        for (Span s : spans) {
            childrenByParent.computeIfAbsent(s.getParentSpanId(), k -> new ArrayList<>()).add(s);
        }

        long totalDuration = spans.stream()
                .filter(s -> s.getDurationMs() != null)
                .mapToLong(Span::getDurationMs)
                .max().orElse(1L);
        // Use the root span's duration (the overall request time) as the denominator when available
        Optional<Span> root = spans.stream().filter(s -> s.getParentSpanId() == null).findFirst();
        if (root.isPresent() && root.get().getDurationMs() != null && root.get().getDurationMs() > 0) {
            totalDuration = root.get().getDurationMs();
        }

        List<Diagnosis.SpanScore> spanScores = new ArrayList<>();
        Span bestSpan = null;
        double bestScore = -1;
        StringBuilder bestReason = new StringBuilder();

        for (Span s : spans) {
            double score = 0;
            List<String> reasons = new ArrayList<>();

            boolean hasError = s.getStatus() == Span.SpanStatus.ERROR;
            if (hasError) {
                score += W_ERROR;
                reasons.add("span reported an error");
            }

            if (hasError) {
                List<Span> children = childrenByParent.getOrDefault(s.getSpanId(), List.of());
                boolean hasFailingChild = children.stream().anyMatch(c -> c.getStatus() == Span.SpanStatus.ERROR);
                if (!hasFailingChild) {
                    score += W_ORIGIN;
                    reasons.add("no failing descendants - this is the deepest point of failure");
                }
            }

            double latencyRatio = 0;
            if (s.getDurationMs() != null && totalDuration > 0) {
                latencyRatio = Math.min(1.0, (double) s.getDurationMs() / (double) totalDuration);
                score += W_LATENCY * latencyRatio;
                if (latencyRatio > 0.5) {
                    reasons.add(String.format("consumed %.0f%% of total request time", latencyRatio * 100));
                }
            }

            score = Math.min(1.0, score);
            String reasonStr = reasons.isEmpty() ? "no anomaly signals" : String.join("; ", reasons);
            spanScores.add(new Diagnosis.SpanScore(s.getService(), s.getOperation(), round(score), reasonStr));

            if (score > bestScore) {
                bestScore = score;
                bestSpan = s;
                bestReason = new StringBuilder(reasonStr);
            }
        }

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setRequestId(requestId);
        diagnosis.setSpanScores(spanScores);

        if (bestSpan != null) {
            diagnosis.setRootCauseService(bestSpan.getService());
            diagnosis.setRootCauseOperation(bestSpan.getOperation());
            diagnosis.setConfidence(round(bestScore));
            diagnosis.setPropagationPath(buildPropagationPath(spans, bestSpan));
            diagnosis.setExplanation(buildExplanation(bestSpan, bestReason.toString(), diagnosis.getPropagationPath()));

            trace.setRootCauseService(bestSpan.getService());
            trace.setRootCauseConfidence(round(bestScore));
            traceRepository.save(trace);
        }

        return diagnosis;
    }

    /** Walks parent pointers from the root-cause span back up to the entry point. */
    private List<String> buildPropagationPath(List<Span> spans, Span rootCauseSpan) {
        Map<String, Span> bySpanId = new HashMap<>();
        for (Span s : spans) bySpanId.put(s.getSpanId(), s);

        LinkedList<String> path = new LinkedList<>();
        Span cursor = rootCauseSpan;
        Set<String> visited = new HashSet<>();
        while (cursor != null && visited.add(cursor.getSpanId())) {
            path.addFirst(cursor.getService());
            cursor = cursor.getParentSpanId() == null ? null : bySpanId.get(cursor.getParentSpanId());
        }
        return path;
    }

    private String buildExplanation(Span rootCause, String reason, List<String> path) {
        String pathStr = String.join(" -> ", path);
        if (rootCause.getStatus() == Span.SpanStatus.ERROR) {
            return String.format(
                "Root cause: %s (%s). %s. Failure entered at this layer and propagated up through: %s. Error detail: %s",
                rootCause.getService(), rootCause.getOperation(), capitalize(reason), pathStr,
                rootCause.getErrorMessage() != null ? rootCause.getErrorMessage() : "n/a"
            );
        }
        return String.format(
            "No hard error occurred, but %s (%s) dominated the request latency (%s). Request path: %s.",
            rootCause.getService(), rootCause.getOperation(), reason, pathStr
        );
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private double round(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }
}

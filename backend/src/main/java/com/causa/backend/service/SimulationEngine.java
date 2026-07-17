package com.causa.backend.service;

import com.causa.backend.model.Span;
import com.causa.backend.model.Trace;
import com.causa.backend.repository.SpanRepository;
import com.causa.backend.repository.TraceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

/**
 * Simulates a realistic microservice call chain:
 *   api-gateway -> auth-service -> order-service -> payment-service -> database
 *
 * Each scenario injects a different fault so the RCA engine has something
 * real to diagnose. This stands in for actual instrumented services (which
 * in a production CAUSA deployment would push spans via an OpenTelemetry-style
 * SDK instead of being simulated here).
 */
@Service
public class SimulationEngine {

    @Autowired private SpanRepository spanRepository;
    @Autowired private TraceRepository traceRepository;
    @Autowired private RootCauseEngine rootCauseEngine;

    private final Random random = new Random();

    public enum Scenario {
        SUCCESS,             // clean happy path
        DB_TIMEOUT,          // database layer times out -> cascades up
        AUTH_FAILURE,        // auth-service rejects the request early
        PAYMENT_ERROR,       // payment-service throws downstream of a healthy DB call
        HIGH_LATENCY,        // no hard error, but order-service is abnormally slow (degraded)
        CASCADING_FAILURE    // payment-service fails AND causes order-service to time out waiting on it
    }

    public Trace runScenario(Scenario scenario) {
        String requestId = UUID.randomUUID().toString();
        Trace trace = new Trace(requestId, "POST /checkout", scenario.name());
        List<Span> spans = new ArrayList<>();

        Instant t0 = Instant.now();
        Span gateway = startSpan(requestId, null, "api-gateway", Span.Layer.FRONTEND, "POST /checkout", t0);

        Instant t1 = t0.plusMillis(jitter(5, 15));
        Span auth = startSpan(requestId, gateway.getSpanId(), "auth-service", Span.Layer.BACKEND, "verifyToken()", t1);

        if (scenario == Scenario.AUTH_FAILURE) {
            Instant authEnd = t1.plusMillis(jitter(20, 40));
            finish(auth, authEnd, Span.SpanStatus.ERROR, "401 Unauthorized: token expired");
            finish(gateway, authEnd.plusMillis(2), Span.SpanStatus.ERROR, "Upstream auth-service rejected request");
            spans.add(gateway); spans.add(auth);
            return persist(trace, spans, Trace.TraceStatus.FAILED, gateway.getStartTime(), authEnd.plusMillis(2));
        }
        Instant authEnd = t1.plusMillis(jitter(15, 35));
        finish(auth, authEnd, Span.SpanStatus.OK, null);
        spans.add(auth);

        Instant t2 = authEnd.plusMillis(jitter(3, 10));
        Span order = startSpan(requestId, gateway.getSpanId(), "order-service", Span.Layer.BACKEND, "createOrder()", t2);

        Instant t3 = t2.plusMillis(jitter(5, 15));
        Span db1 = startSpan(requestId, order.getSpanId(), "database", Span.Layer.DB, "INSERT INTO orders", t3);

        if (scenario == Scenario.DB_TIMEOUT) {
            Instant dbEnd = t3.plusMillis(jitter(2000, 3000));
            finish(db1, dbEnd, Span.SpanStatus.ERROR, "Query timeout after 2500ms: connection pool exhausted");
            finish(order, dbEnd.plusMillis(3), Span.SpanStatus.ERROR, "Failed to persist order: database timeout");
            finish(gateway, dbEnd.plusMillis(6), Span.SpanStatus.ERROR, "Downstream order-service failed");
            spans.add(db1); spans.add(order); spans.add(gateway);
            return persist(trace, spans, Trace.TraceStatus.FAILED, gateway.getStartTime(), dbEnd.plusMillis(6));
        }

        Instant dbEnd = t3.plusMillis(jitter(20, 60));
        finish(db1, dbEnd, Span.SpanStatus.OK, null);
        spans.add(db1);
        finish(order, dbEnd.plusMillis(jitter(2, 8)), Span.SpanStatus.OK, null);
        spans.add(order);

        Instant t4 = order.getEndTime().plusMillis(jitter(3, 10));
        Span payment = startSpan(requestId, gateway.getSpanId(), "payment-service", Span.Layer.BACKEND, "chargeCard()", t4);

        if (scenario == Scenario.PAYMENT_ERROR) {
            Instant payEnd = t4.plusMillis(jitter(80, 150));
            finish(payment, payEnd, Span.SpanStatus.ERROR, "502 Bad Gateway: payment provider unreachable");
            finish(gateway, payEnd.plusMillis(4), Span.SpanStatus.ERROR, "Downstream payment-service failed");
            spans.add(payment); spans.add(gateway);
            return persist(trace, spans, Trace.TraceStatus.FAILED, gateway.getStartTime(), payEnd.plusMillis(4));
        }

        if (scenario == Scenario.CASCADING_FAILURE) {
            Instant payEnd = t4.plusMillis(jitter(1500, 2200));
            finish(payment, payEnd, Span.SpanStatus.ERROR, "Payment gateway connection reset");
            Instant orderTimeoutEnd = payEnd.plusMillis(jitter(500, 800));
            Span orderRetry = startSpan(requestId, order.getSpanId(), "order-service", Span.Layer.BACKEND, "awaitPaymentConfirmation()", payEnd);
            finish(orderRetry, orderTimeoutEnd, Span.SpanStatus.ERROR, "Timed out waiting on payment-service");
            finish(gateway, orderTimeoutEnd.plusMillis(5), Span.SpanStatus.ERROR, "Cascading failure from payment-service");
            spans.add(payment); spans.add(orderRetry); spans.add(gateway);
            return persist(trace, spans, Trace.TraceStatus.FAILED, gateway.getStartTime(), orderTimeoutEnd.plusMillis(5));
        }

        if (scenario == Scenario.HIGH_LATENCY) {
            Instant payEnd = t4.plusMillis(jitter(900, 1400)); // slow but not erroring
            finish(payment, payEnd, Span.SpanStatus.OK, null);
            spans.add(payment);
            finish(gateway, payEnd.plusMillis(jitter(2, 8)), Span.SpanStatus.OK, null);
            spans.add(gateway);
            return persist(trace, spans, Trace.TraceStatus.DEGRADED, gateway.getStartTime(), gateway.getEndTime());
        }

        // SUCCESS path
        Instant payEnd = t4.plusMillis(jitter(40, 90));
        finish(payment, payEnd, Span.SpanStatus.OK, null);
        spans.add(payment);
        finish(gateway, payEnd.plusMillis(jitter(2, 6)), Span.SpanStatus.OK, null);
        spans.add(gateway);
        return persist(trace, spans, Trace.TraceStatus.SUCCESS, gateway.getStartTime(), gateway.getEndTime());
    }

    /** Runs a random weighted mix, biased toward success like a real system. */
    public Trace runRandomScenario() {
        int roll = random.nextInt(100);
        Scenario scenario;
        if (roll < 65) scenario = Scenario.SUCCESS;
        else if (roll < 75) scenario = Scenario.HIGH_LATENCY;
        else if (roll < 84) scenario = Scenario.DB_TIMEOUT;
        else if (roll < 90) scenario = Scenario.PAYMENT_ERROR;
        else if (roll < 96) scenario = Scenario.AUTH_FAILURE;
        else scenario = Scenario.CASCADING_FAILURE;
        return runScenario(scenario);
    }

    private Span startSpan(String requestId, String parentId, String service, Span.Layer layer, String op, Instant start) {
        Span s = new Span(UUID.randomUUID().toString(), requestId, parentId, service, layer, op);
        s.setStartTime(start);
        return s;
    }

    private void finish(Span s, Instant end, Span.SpanStatus status, String errorMessage) {
        s.finish(end, status, errorMessage);
    }

    private int jitter(int minMs, int maxMs) {
        return minMs + random.nextInt(Math.max(1, maxMs - minMs));
    }

    private Trace persist(Trace trace, List<Span> spans, Trace.TraceStatus status, Instant start, Instant end) {
        trace.setStatus(status);
        trace.setStartTime(start);
        trace.setEndTime(end);
        trace.setTotalDurationMs(end.toEpochMilli() - start.toEpochMilli());
        traceRepository.save(trace);
        spanRepository.saveAll(spans);

        // Run RCA immediately for anything not a clean success so the dashboard
        // and trace detail view have a diagnosis ready without a second request.
        if (status != Trace.TraceStatus.SUCCESS) {
            rootCauseEngine.diagnose(trace.getRequestId());
        }
        return trace;
    }
}

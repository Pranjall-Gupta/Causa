package com.causa.agent;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

/**
 * Registered automatically for every incoming HTTP request. Reads the
 * X-Causa-Trace-Id / X-Causa-Parent-Span-Id headers if a caller upstream set
 * them (via CausaRestTemplateInterceptor), otherwise this request is treated
 * as the origin of a brand-new trace.
 */
public class CausaFilter implements Filter {

    public static final String TRACE_ID_HEADER = "X-Causa-Trace-Id";
    public static final String PARENT_SPAN_HEADER = "X-Causa-Parent-Span-Id";

    private final CausaProperties properties;
    private final CausaSpanCollector collector;

    public CausaFilter(CausaProperties properties, CausaSpanCollector collector) {
        this.properties = properties;
        this.collector = collector;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (!properties.isEnabled() || !(req instanceof HttpServletRequest httpReq) || !(res instanceof HttpServletResponse httpRes)) {
            chain.doFilter(req, res);
            return;
        }

        String traceId = httpReq.getHeader(TRACE_ID_HEADER);
        String parentSpanId = httpReq.getHeader(PARENT_SPAN_HEADER);
        if (traceId == null || traceId.isBlank()) traceId = UUID.randomUUID().toString();

        String spanId = UUID.randomUUID().toString();
        String operation = httpReq.getMethod() + " " + httpReq.getRequestURI();
        Instant start = Instant.now();

        CausaTraceContext.set(traceId, spanId);
        String errorMessage = null;
        boolean threw = false;
        try {
            chain.doFilter(req, res);
        } catch (Throwable t) {
            threw = true;
            errorMessage = t.getMessage() != null ? t.getMessage() : t.getClass().getSimpleName();
            throw t;
        } finally {
            Instant end = Instant.now();
            CausaSpanRecord record = new CausaSpanRecord(
                    spanId, traceId, parentSpanId, properties.getServiceName(),
                    "BACKEND", operation, start);
            record.endTime = end;
            int status = httpRes.getStatus();
            if (threw || status >= 400) {
                record.status = "ERROR";
                record.errorMessage = errorMessage != null ? errorMessage : ("HTTP " + status);
            } else {
                record.status = "OK";
            }
            collector.record(record);
            CausaTraceContext.clear();
        }
    }
}

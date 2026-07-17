package com.causa.agent;

/**
 * Holds the "where am I in the trace tree" state for the current thread.
 * Set by CausaFilter when a request comes in; read by CausaTracer and
 * CausaRestTemplateInterceptor to link new spans as children of whatever
 * span is currently active, and to propagate headers on outgoing calls.
 */
public class CausaTraceContext {

    private static final ThreadLocal<Frame> CURRENT = new ThreadLocal<>();

    public static class Frame {
        public final String traceId;
        public final String currentSpanId;

        public Frame(String traceId, String currentSpanId) {
            this.traceId = traceId;
            this.currentSpanId = currentSpanId;
        }
    }

    public static Frame current() {
        return CURRENT.get();
    }

    public static void set(String traceId, String currentSpanId) {
        CURRENT.set(new Frame(traceId, currentSpanId));
    }

    public static void clear() {
        CURRENT.remove();
    }
}

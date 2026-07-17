package com.causa.agent;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * application.properties:
 *   causa.enabled=true
 *   causa.endpoint=http://localhost:8080
 *   causa.service-name=order-service
 */
@ConfigurationProperties(prefix = "causa")
public class CausaProperties {

    /** Master switch - set false to disable all instrumentation without removing the dependency. */
    private boolean enabled = true;

    /** Base URL of the CAUSA backend, e.g. http://localhost:8080 */
    private String endpoint = "http://localhost:8080";

    /** How this service identifies itself in traces, e.g. "order-service" */
    private String serviceName = "unnamed-service";

    /** Batch flush interval in milliseconds. */
    private long flushIntervalMs = 2000;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public long getFlushIntervalMs() { return flushIntervalMs; }
    public void setFlushIntervalMs(long flushIntervalMs) { this.flushIntervalMs = flushIntervalMs; }
}

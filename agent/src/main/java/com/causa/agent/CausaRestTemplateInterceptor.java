package com.causa.agent;

import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

/**
 * Register this as a RestTemplate interceptor in the host app:
 *
 *   @Bean
 *   RestTemplate restTemplate(CausaRestTemplateInterceptor interceptor) {
 *       RestTemplate rt = new RestTemplate();
 *       rt.getInterceptors().add(interceptor);
 *       return rt;
 *   }
 *
 * Every outgoing call through that RestTemplate carries the current trace
 * forward via headers, and is itself recorded as a span so you can see
 * "order-service called payment-service and it took 1400ms" in the trace.
 */
public class CausaRestTemplateInterceptor implements ClientHttpRequestInterceptor {

    private final CausaProperties properties;
    private final CausaSpanCollector collector;

    public CausaRestTemplateInterceptor(CausaProperties properties, CausaSpanCollector collector) {
        this.properties = properties;
        this.collector = collector;
    }

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        CausaTraceContext.Frame frame = CausaTraceContext.current();
        if (!properties.isEnabled() || frame == null) {
            return execution.execute(request, body); // no active trace (e.g. app startup call) - just pass through
        }

        String spanId = UUID.randomUUID().toString();
        String operation = request.getMethod() + " " + request.getURI().getPath();
        Instant start = Instant.now();

        request.getHeaders().set(CausaFilter.TRACE_ID_HEADER, frame.traceId);
        request.getHeaders().set(CausaFilter.PARENT_SPAN_HEADER, spanId);

        CausaSpanRecord record = new CausaSpanRecord(
                spanId, frame.traceId, frame.currentSpanId,
                properties.getServiceName(), "BACKEND", operation, start);
        try {
            ClientHttpResponse response = execution.execute(request, body);
            record.endTime = Instant.now();
            int status = response.getStatusCode().value();
            record.status = status >= 400 ? "ERROR" : "OK";
            if (status >= 400) record.errorMessage = "Downstream returned HTTP " + status;
            collector.record(record);
            return response;
        } catch (IOException e) {
            record.endTime = Instant.now();
            record.status = "ERROR";
            record.errorMessage = e.getMessage();
            collector.record(record);
            throw e;
        }
    }
}

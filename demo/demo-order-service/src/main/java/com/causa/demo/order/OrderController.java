package com.causa.demo.order;

import com.causa.agent.CausaTracer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * POST /demo/checkout is the whole point of this throwaway service: it
 * exercises every piece of the real pipeline in one call.
 *
 *   1. CausaFilter (in causa-agent) auto-records this request as a span
 *   2. RestTemplate call to demo-auth-service carries the trace ID forward
 *      via headers and records itself as a child span
 *   3. CausaTracer.trace(...) manually wraps a fake DB write as another
 *      child span (DB calls aren't HTTP, so they need manual instrumentation)
 *   4. Everything gets batched and POSTed to CAUSA's /api/spans/batch by the
 *      agent's background flush thread
 *
 * Open http://localhost:5173 (the CAUSA dashboard) and hit this endpoint a
 * few times via curl/Postman - real traces should show up within ~2s.
 */
@RestController
public class OrderController {

    private final RestTemplate restTemplate;
    private final CausaTracer causaTracer;

    @Value("${demo.auth-service-url}")
    private String authServiceUrl;

    public OrderController(RestTemplate restTemplate, CausaTracer causaTracer) {
        this.restTemplate = restTemplate;
        this.causaTracer = causaTracer;
    }

    @PostMapping("/demo/checkout")
    public ResponseEntity<Map<String, Object>> checkout() {
        // 1. call auth-service - propagates trace headers automatically
        try {
            restTemplate.postForObject(authServiceUrl + "/auth/verify", null, Map.class);
        } catch (RestClientException e) {
            return ResponseEntity.status(401).body(Map.of("error", "auth failed: " + e.getMessage()));
        }

        // 2. manually-instrumented "database" span - simulates a write with occasional slowness/failure
        String orderId = causaTracer.trace("database", "INSERT INTO demo_orders", () -> {
            int roll = ThreadLocalRandom.current().nextInt(100);
            try {
                if (roll < 10) {
                    Thread.sleep(ThreadLocalRandom.current().nextInt(800, 1500));
                    throw new RuntimeException("connection pool exhausted");
                }
                Thread.sleep(ThreadLocalRandom.current().nextInt(15, 60));
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
            return UUID.randomUUID().toString();
        });

        return ResponseEntity.ok(Map.of("orderId", orderId, "status", "confirmed"));
    }
}

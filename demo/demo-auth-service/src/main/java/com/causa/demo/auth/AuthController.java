package com.causa.demo.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Deliberately flaky: fails about 1 in 6 requests with a 401, and sometimes
 * takes noticeably longer, so there's something real for CAUSA to catch and
 * diagnose - not just a clean happy path.
 */
@RestController
public class AuthController {

    @PostMapping("/auth/verify")
    public ResponseEntity<Map<String, Object>> verify() throws InterruptedException {
        int roll = ThreadLocalRandom.current().nextInt(100);

        if (roll < 15) {
            Thread.sleep(400); // slow-fail: still fails, but after a delay
            return ResponseEntity.status(401).body(Map.of("error", "token expired"));
        }
        if (roll < 25) {
            Thread.sleep(ThreadLocalRandom.current().nextInt(300, 600)); // just slow, not an error
        } else {
            Thread.sleep(ThreadLocalRandom.current().nextInt(10, 40)); // normal
        }
        return ResponseEntity.ok(Map.of("valid", true, "userId", "demo-user-1"));
    }
}

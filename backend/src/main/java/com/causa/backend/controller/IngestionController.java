package com.causa.backend.controller;

import com.causa.backend.dto.SpanIngestDto;
import com.causa.backend.service.IngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * This is the endpoint that turns CAUSA from "simulates its own data" into
 * "actually monitors a real project". Any service running the causa-agent
 * (or posting this exact JSON shape from any language) shows up here.
 */
@RestController
@RequestMapping("/api")
public class IngestionController {

    @Autowired private IngestionService ingestionService;

    @PostMapping("/spans")
    public ResponseEntity<Void> ingestOne(@RequestBody SpanIngestDto span) {
        ingestionService.ingest(List.of(span));
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/spans/batch")
    public ResponseEntity<Void> ingestBatch(@RequestBody List<SpanIngestDto> spans) {
        ingestionService.ingest(spans);
        return ResponseEntity.accepted().build();
    }
}

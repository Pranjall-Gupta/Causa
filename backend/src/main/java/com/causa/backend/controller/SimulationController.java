package com.causa.backend.controller;

import com.causa.backend.model.Trace;
import com.causa.backend.service.SimulationEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Triggers simulated request traffic. In a real deployment these spans would
 * arrive from instrumented services instead of being generated here.
 */
@RestController
@RequestMapping("/api/simulate")
public class SimulationController {

    @Autowired private SimulationEngine simulationEngine;

    @PostMapping("/random")
    public Trace simulateRandom() {
        return simulationEngine.runRandomScenario();
    }

    @PostMapping("/{scenario}")
    public Trace simulateScenario(@PathVariable String scenario) {
        SimulationEngine.Scenario s = SimulationEngine.Scenario.valueOf(scenario.toUpperCase());
        return simulationEngine.runScenario(s);
    }

    @PostMapping("/burst/{count}")
    public String simulateBurst(@PathVariable int count) {
        int n = Math.min(count, 200);
        for (int i = 0; i < n; i++) simulationEngine.runRandomScenario();
        return n + " traces generated";
    }
}

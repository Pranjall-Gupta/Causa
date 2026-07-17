package com.causa.backend;

import com.causa.backend.service.SimulationEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// Seeds the in-memory DB with ~40 traces on startup so the dashboard
	// isn't empty the first time you open it. Remove this bean once you're
	// wiring in real service traffic.
	@Bean
	CommandLineRunner seedData(SimulationEngine simulationEngine) {
		return args -> {
			for (int i = 0; i < 40; i++) {
				simulationEngine.runRandomScenario();
			}
		};
	}
}

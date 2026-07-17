package com.causa.demo.order;

import com.causa.agent.CausaRestTemplateInterceptor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class DemoOrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoOrderServiceApplication.class, args);
	}

	// Wiring the agent's interceptor into RestTemplate is the one manual step -
	// this is what makes outgoing calls carry the trace forward and get recorded.
	@Bean
	public RestTemplate restTemplate(CausaRestTemplateInterceptor causaInterceptor) {
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.getInterceptors().add(causaInterceptor);
		return restTemplate;
	}
}

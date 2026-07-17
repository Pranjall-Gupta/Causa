package com.causa.agent;

import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Auto-registered the moment causa-agent is on the classpath (see
 * META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports).
 * All the host project needs is the dependency + these two lines in
 * application.properties:
 *
 *   causa.endpoint=http://localhost:8080
 *   causa.service-name=order-service
 */
@Configuration
@EnableConfigurationProperties(CausaProperties.class)
@ConditionalOnProperty(prefix = "causa", name = "enabled", havingValue = "true", matchIfMissing = true)
public class CausaAutoConfiguration {

    @Bean
    public CausaSpanCollector causaSpanCollector(CausaProperties properties) {
        return new CausaSpanCollector(properties);
    }

    @Bean
    public CausaTracer causaTracer(CausaProperties properties, CausaSpanCollector collector) {
        return new CausaTracer(properties, collector);
    }

    @Bean
    public CausaRestTemplateInterceptor causaRestTemplateInterceptor(CausaProperties properties, CausaSpanCollector collector) {
        return new CausaRestTemplateInterceptor(properties, collector);
    }

    @Bean
    public FilterRegistrationBean<CausaFilter> causaFilterRegistration(CausaProperties properties, CausaSpanCollector collector) {
        FilterRegistrationBean<CausaFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CausaFilter(properties, collector));
        registration.addUrlPatterns("/*");
        registration.setOrder(1); // run early so timing captures the whole request
        registration.setName("causaFilter");
        return registration;
    }

    /** Small holder bean purely so we have somewhere to put @PreDestroy for a clean flush on shutdown. */
    @Bean
    public CausaShutdownHook causaShutdownHook(CausaSpanCollector collector) {
        return new CausaShutdownHook(collector);
    }

    public static class CausaShutdownHook {
        private final CausaSpanCollector collector;
        public CausaShutdownHook(CausaSpanCollector collector) { this.collector = collector; }
        @PreDestroy
        public void onShutdown() { collector.shutdown(); }
    }
}

// Mock Axios Interceptor for CAUSA
import axios from 'axios';
import { mockAlerts, mockGraph, mockRCA } from './mockData';

console.log('CAUSA Standalone Mode: Initializing axios mock interceptors...');

// Configure axios request interceptor to return mock responses locally
axios.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    console.log(`[CAUSA Mock] Intercepted request to: ${url}`);

    if (url.includes('/v1/alerts')) {
      console.log('[CAUSA Mock] Resolving /v1/alerts with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockAlerts,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/graph')) {
      console.log('[CAUSA Mock] Resolving /v1/graph with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockGraph,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/rca')) {
      console.log('[CAUSA Mock] Resolving /v1/rca with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockRCA,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/admin/projects')) {
      console.log('[CAUSA Mock] Resolving /v1/admin/projects with mock data');
      config.adapter = () => {
        let name = 'mock-service';
        try {
          const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
          if (body && body.name) {
            name = body.name;
          }
        } catch (e) {
          // fallback
        }
        return Promise.resolve({
          data: {
            id: Math.floor(Math.random() * 1000) + 1,
            name: name,
            apiKey: 'causa_proj_' + Math.random().toString(36).substring(2, 15)
          },
          status: 201,
          statusText: 'Created',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/fix-suggestion')) {
      console.log('[CAUSA Mock] Resolving /v1/fix-suggestion with mock AI Foundry diagnosis');
      config.adapter = () => {
        let alertId = 'alert-checkout-high-error-rate';
        let trajectoryScore = null;
        try {
          const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
          if (body && body.symptomAlertId) {
            alertId = body.symptomAlertId;
          }
          if (body && body.trajectoryScore) {
            trajectoryScore = body.trajectoryScore;
          }
        } catch (e) {
          // fallback
        }

        let summary = "Cascading failure in checkout flow: downstream payment-service HTTP 500 timeouts are causing connection starvation on checkout-api.";
        let suggestedFix = "1. Increase HikariCP maximum-pool-size from 10 to 30 in payment-service application.properties.\n2. Configure Resilience4j circuit breaker on order-service -> payment-service with a 2.0s fallback.\n3. Scale checkout-api deployment replica count from 1 to 3 to absorb request queues.";
        let confidence = "HIGH";

        if (alertId.includes('payment') || (trajectoryScore && trajectoryScore > 0.8)) {
          summary = "Payment-service database socket timeout under high concurrency leading to thread pool exhaustion.";
          suggestedFix = "1. Add composite database index on `payment_transactions(order_id, status)`.\n2. Set `spring.datasource.hikari.connection-timeout=5000` to prevent thread hangs.\n3. Enable Redis caching for redundant payment method lookups.";
          confidence = "HIGH";
        } else if (alertId.includes('inventory') || (trajectoryScore && trajectoryScore >= 0.5)) {
          summary = "Inventory database query latency exceeds 500ms threshold during stock verification calls.";
          suggestedFix = "1. Review inventory database slow query logs and optimize `stock_items` query execution plan.\n2. Implement a local Caffeine cache in inventory-service for frequently checked SKU counts.";
          confidence = "MEDIUM";
        }

        return Promise.resolve({
          data: {
            alertId: alertId,
            provider: "Azure AI Foundry (gpt-5-mini)",
            summary: summary,
            suggestedFix: suggestedFix,
            confidence: confidence
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

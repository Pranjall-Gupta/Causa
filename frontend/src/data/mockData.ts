import type { DashboardSummary } from '../types';

export const mockSummary: DashboardSummary = {
  avgLatencyMs: 312.4,
  errorRatePercent: 8.2,
  totalRequests: 1847,
  systemHealthIndex: 82.5,
  latencyTrendPercent: -3.1,
  errorTrendPercent: 1.8,
  healthTrendPercent: -1.1,
  timeline: Array.from({ length: 24 }, (_, i) => {
    const spike = i === 14;
    return {
      label: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      value: spike ? 88 : 12 + Math.random() * 20,
      anomaly: spike,
    };
  }),
  services: [
    { service: 'api-gateway', layer: 'FRONTEND', requestCount: 1847, successRatePercent: 96.4, trend: 'up', dominantIssue: 'Healthy', avgLatencyMs: 18 },
    { service: 'auth-service', layer: 'BACKEND', requestCount: 1847, successRatePercent: 98.1, trend: 'flat', dominantIssue: 'Auth Failure', avgLatencyMs: 24 },
    { service: 'order-service', layer: 'BACKEND', requestCount: 1690, successRatePercent: 94.2, trend: 'down', dominantIssue: 'Timeout', avgLatencyMs: 46 },
    { service: 'payment-service', layer: 'BACKEND', requestCount: 1690, successRatePercent: 91.7, trend: 'down', dominantIssue: 'Upstream Error', avgLatencyMs: 612 },
    { service: 'database', layer: 'DB', requestCount: 1690, successRatePercent: 97.8, trend: 'up', dominantIssue: 'Timeout', avgLatencyMs: 38 },
  ],
  serviceFlowOrder: ['api-gateway', 'auth-service', 'order-service', 'payment-service', 'database'],
};

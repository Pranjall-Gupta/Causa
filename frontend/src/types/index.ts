export interface TimeBucket {
  label: string;
  value: number;
  anomaly: boolean;
}

export interface ServiceHealth {
  service: string;
  layer: string;
  requestCount: number;
  successRatePercent: number;
  trend: 'up' | 'down' | 'flat';
  dominantIssue: string;
  avgLatencyMs: number;
}

export interface DashboardSummary {
  avgLatencyMs: number;
  errorRatePercent: number;
  totalRequests: number;
  systemHealthIndex: number;
  timeline: TimeBucket[];
  services: ServiceHealth[];
  serviceFlowOrder: string[];
  latencyTrendPercent: number;
  errorTrendPercent: number;
  healthTrendPercent: number;
}

export interface Trace {
  requestId: string;
  entryPoint: string;
  scenario: string;
  status: 'SUCCESS' | 'FAILED' | 'DEGRADED';
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  rootCauseService: string | null;
  rootCauseConfidence: number | null;
}

export interface Span {
  spanId: string;
  requestId: string;
  parentSpanId: string | null;
  service: string;
  layer: 'FRONTEND' | 'BACKEND' | 'DB';
  operation: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'OK' | 'ERROR';
  errorMessage: string | null;
}

export interface Diagnosis {
  requestId: string;
  rootCauseService: string;
  rootCauseOperation: string;
  confidence: number;
  explanation: string;
  propagationPath: string[];
  spanScores: { service: string; operation: string; score: number; reason: string }[];
}

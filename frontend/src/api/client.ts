import type { DashboardSummary, Trace, Span, Diagnosis } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST' });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboardSummary: () => get<DashboardSummary>('/api/dashboard/summary'),
  getRecentTraces: () => get<Trace[]>('/api/traces'),
  getTraceDetail: (requestId: string) => get<Span[]>(`/api/traces/${requestId}`),
  getDiagnosis: (requestId: string) => get<Diagnosis>(`/api/traces/${requestId}/diagnosis`),
  simulateRandom: () => post<Trace>('/api/simulate/random'),
  simulateScenario: (scenario: string) => post<Trace>(`/api/simulate/${scenario}`),
  simulateBurst: (count: number) => post<string>(`/api/simulate/burst/${count}`),
};

import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { FailureTimelineChart } from '../components/FailureTimelineChart';
import { RequestVolumePanel } from '../components/RequestVolumePanel';
import { ServiceHealthTable } from '../components/ServiceHealthTable';
import { RequestFlowWidget } from '../components/RequestFlowWidget';
import { api } from '../api/client';
import { mockSummary } from '../data/mockData';
import type { DashboardSummary } from '../types';

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(mockSummary);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
      setLive(true);
    } catch {
      setLive(false); // backend not reachable - keep showing mock data
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleSimulateBurst = async () => {
    setLoading(true);
    try {
      await api.simulateBurst(15);
      await refresh();
    } catch {
      /* backend offline, ignore */
    } finally {
      setLoading(false);
    }
  };

  const degradedApprox = Math.round(summary.totalRequests * 0.08);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
              {live ? 'Connected to CAUSA backend' : 'Showing sample data — start the backend to see live traces'}
            </div>
          </div>
          <button onClick={handleSimulateBurst} disabled={loading} style={buttonStyle}>
            {loading ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
            Simulate Traffic
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard
            label="Avg Request Latency"
            value={`${summary.avgLatencyMs.toFixed(0)} ms`}
            trendPercent={summary.latencyTrendPercent}
            trendIsGood={false}
            sparkline={[20, 35, 18, 42, 30, 25, 38]}
          />
          <StatCard
            label="System Health Index"
            value={`${summary.systemHealthIndex.toFixed(1)}/100`}
            trendPercent={summary.healthTrendPercent}
            trendIsGood={true}
            sparkline={[60, 72, 65, 80, 75, 82, 78]}
          />
          <StatCard
            label="Error Rate"
            value={`${summary.errorRatePercent.toFixed(1)}%`}
            trendPercent={summary.errorTrendPercent}
            trendIsGood={false}
            sparkline={[5, 8, 4, 12, 6, 9, 7]}
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <FailureTimelineChart data={summary.timeline} />
          <RequestVolumePanel
            totalRequests={summary.totalRequests}
            errorRatePercent={summary.errorRatePercent}
            successCount={Math.max(0, summary.totalRequests - degradedApprox)}
            degradedCount={degradedApprox}
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <ServiceHealthTable services={summary.services} />
          <RequestFlowWidget services={summary.services} flowOrder={summary.serviceFlowOrder} />
        </div>
      </main>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7,
  background: 'var(--accent-green)', color: '#08130c', border: 'none',
  borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};

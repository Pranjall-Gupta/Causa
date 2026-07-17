import { TrendingUp, TrendingDown, Minus, MoreVertical } from 'lucide-react';
import type { ServiceHealth } from '../types';

const LAYER_DOT: Record<string, string> = {
  FRONTEND: '#60a5fa',
  BACKEND: 'var(--accent-green-light)',
  DB: 'var(--accent-amber)',
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={13} color="var(--accent-green-light)" />;
  if (trend === 'down') return <TrendingDown size={13} color="var(--accent-red)" />;
  return <Minus size={13} color="var(--text-muted)" />;
}

export function ServiceHealthTable({ services }: { services: ServiceHealth[] }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>Service Health by Layer</div>
        <div style={styles.pill}>All services ▾</div>
      </div>

      <div style={styles.tableHead}>
        <span style={{ flex: 2.2 }}>Service</span>
        <span style={{ flex: 1 }}>Layer</span>
        <span style={{ flex: 1 }}>Success</span>
        <span style={{ flex: 1 }}>Trend</span>
        <span style={{ flex: 1.6 }}>Dominant Issue</span>
        <span style={{ flex: 1 }}>Avg Latency</span>
        <span style={{ width: 20 }} />
      </div>

      {services.map((s) => (
        <div key={s.service} style={styles.row}>
          <span style={{ flex: 2.2, display: 'flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 13.5 }}>
            <span style={{ ...styles.dot, background: LAYER_DOT[s.layer] ?? 'var(--text-muted)' }} />
            {s.service}
            <span style={styles.reqCount}>{s.requestCount.toLocaleString()} reqs</span>
          </span>
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.layer}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.successRatePercent > 95 ? 'var(--accent-green-light)' : 'var(--accent-amber)' }}>
            {s.successRatePercent.toFixed(1)}%
          </span>
          <span style={{ flex: 1 }}><TrendIcon trend={s.trend} /></span>
          <span style={{ flex: 1.6 }}>
            <span style={{ ...styles.issueTag, ...(s.dominantIssue === 'Healthy' ? styles.issueTagOk : styles.issueTagBad) }}>
              {s.dominantIssue}
            </span>
          </span>
          <span style={{ flex: 1, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {s.avgLatencyMs.toFixed(0)}ms
          </span>
          <span style={{ width: 20, color: 'var(--text-muted)' }}><MoreVertical size={14} /></span>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1.8,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 14.5, fontWeight: 600 },
  pill: {
    fontSize: 11.5, color: 'var(--text-secondary)', background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '4px 10px',
  },
  tableHead: {
    display: 'flex', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.3,
    paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)',
  },
  row: {
    display: 'flex', alignItems: 'center', padding: '12px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  dot: { width: 7, height: 7, borderRadius: 99, display: 'inline-block' },
  reqCount: { fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 },
  issueTag: { fontSize: 11, padding: '3px 9px', borderRadius: 999, fontWeight: 500 },
  issueTagOk: { background: 'var(--accent-green-dim)', color: 'var(--accent-green-light)' },
  issueTagBad: { background: 'var(--accent-red-dim)', color: 'var(--accent-red)' },
};

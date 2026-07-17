import type { ServiceHealth } from '../types';

function healthColor(rate: number | undefined) {
  if (rate === undefined) return 'var(--text-muted)';
  if (rate >= 95) return 'var(--accent-green-light)';
  if (rate >= 85) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

export function RequestFlowWidget({ services, flowOrder }: { services: ServiceHealth[]; flowOrder: string[] }) {
  const byName = Object.fromEntries(services.map((s) => [s.service, s]));
  const worst = [...services].sort((a, b) => a.successRatePercent - b.successRatePercent)[0];
  const order = flowOrder.length > 0 ? flowOrder : services.map((s) => s.service);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>Request Flow</div>
        <div style={styles.pill}>Live ▾</div>
      </div>

      <div style={styles.flowColumn}>
        {order.map((name, i) => {
          const s = byName[name];
          const color = healthColor(s?.successRatePercent);
          return (
            <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={styles.nodeRow}>
                <span style={{ ...styles.nodeDot, background: color, boxShadow: `0 0 10px ${color}55` }} />
                <span style={styles.nodeName}>{name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, color }}>
                  {s ? `${s.successRatePercent.toFixed(0)}%` : '—'}
                </span>
              </div>
              {i < order.length - 1 && <div style={styles.connector} />}
            </div>
          );
        })}
      </div>

      {worst && (
        <div style={styles.alertBox}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Needs attention</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{worst.service}</div>
          <div style={{ fontSize: 11.5, color: 'var(--accent-red)' }}>{worst.dominantIssue} · {worst.successRatePercent.toFixed(1)}% success</div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1,
    display: 'flex', flexDirection: 'column',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 14.5, fontWeight: 600 },
  pill: {
    fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '3px 9px',
  },
  flowColumn: { display: 'flex', flexDirection: 'column' },
  nodeRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' },
  nodeDot: { width: 9, height: 9, borderRadius: 99, flexShrink: 0 },
  nodeName: { fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' },
  connector: { width: 1, height: 14, background: 'var(--border-strong)', marginLeft: 4 },
  alertBox: {
    marginTop: 14, padding: '10px 12px', borderRadius: 10,
    background: 'var(--accent-red-dim)', border: '1px solid rgba(239,68,68,0.25)',
  },
};

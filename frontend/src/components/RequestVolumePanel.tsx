import { Cpu, GitMerge } from 'lucide-react';

interface Props {
  totalRequests: number;
  errorRatePercent: number;
  successCount: number;
  degradedCount: number;
}

export function RequestVolumePanel({ totalRequests, errorRatePercent, successCount, degradedCount }: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.title}>Request Volume</div>
        <div style={styles.pill}>50 traces</div>
      </div>

      <div style={styles.bigNumber}>
        {totalRequests.toLocaleString()} <span style={styles.unit}>reqs</span>
      </div>
      <div style={styles.subline}>
        ↓ {errorRatePercent.toFixed(1)}% error rate this window
      </div>

      <div style={styles.rowItem}>
        <div style={styles.iconCircle}>
          <GitMerge size={15} color="var(--accent-green-light)" />
        </div>
        <div>
          <div style={styles.rowValue}>{successCount.toLocaleString()}</div>
          <div style={styles.rowLabel}>Clean requests</div>
        </div>
      </div>

      <div style={styles.rowItem}>
        <div style={{ ...styles.iconCircle, background: 'rgba(245,158,11,0.12)' }}>
          <Cpu size={15} color="var(--accent-amber)" />
        </div>
        <div>
          <div style={styles.rowValue}>{degradedCount.toLocaleString()}</div>
          <div style={styles.rowLabel}>Degraded / high latency</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14.5, fontWeight: 600 },
  pill: {
    fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '3px 9px',
  },
  bigNumber: { fontSize: 30, fontWeight: 800, marginTop: 10 },
  unit: { fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' },
  subline: { fontSize: 12, color: 'var(--accent-green-light)', marginBottom: 10 },
  rowItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border-subtle)' },
  iconCircle: {
    width: 32, height: 32, borderRadius: 10, background: 'var(--accent-green-dim)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowValue: { fontSize: 14.5, fontWeight: 700 },
  rowLabel: { fontSize: 11.5, color: 'var(--text-muted)' },
};

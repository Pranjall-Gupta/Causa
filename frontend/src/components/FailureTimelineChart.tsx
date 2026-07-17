import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import type { TimeBucket } from '../types';

interface Props {
  data: TimeBucket[];
  windowLabel?: string;
}

export function FailureTimelineChart({ data, windowLabel = '24h window' }: Props) {
  const peak = data.reduce((max, d) => (d.value > max.value ? d : max), data[0] ?? { value: 0, label: '' });

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Failure Timeline</div>
          <div style={styles.subtitle}>Anomaly index per request, peak {peak.value.toFixed(1)} at {peak.label}</div>
        </div>
        <div style={styles.pill}>{windowLabel}</div>
      </div>

      <div style={{ height: 220, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <ReferenceLine y={50} stroke="var(--accent-amber)" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Tooltip
              contentStyle={{ background: '#0f1713', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.anomaly ? 'var(--accent-red)' : 'var(--accent-green)'} fillOpacity={d.anomaly ? 0.9 : 0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1.6,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14.5, fontWeight: 600 },
  subtitle: { fontSize: 12, color: 'var(--text-muted)', marginTop: 3 },
  pill: {
    fontSize: 11.5, color: 'var(--text-secondary)', background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '4px 10px',
  },
};

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  label: string;
  value: string;
  trendPercent: number;
  trendIsGood: boolean; // whether a positive trendPercent should be shown as green
  sparkline: number[];
}

export function StatCard({ label, value, trendPercent, trendIsGood, sparkline }: StatCardProps) {
  const positive = trendPercent >= 0;
  const good = positive === trendIsGood;
  const data = sparkline.map((v, i) => ({ i, v }));

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={styles.label}>{label}</div>
          <div style={styles.value}>{value}</div>
          <div style={{ ...styles.trend, color: good ? 'var(--accent-green-light)' : 'var(--accent-red)' }}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trendPercent).toFixed(1)}% than last period
          </div>
        </div>
        <div style={{ width: 64, height: 36 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="v" radius={[2, 2, 0, 0]} fill={good ? 'var(--accent-green)' : 'var(--accent-red)'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
    flex: 1,
  },
  label: { fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 },
  value: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  trend: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500 },
};

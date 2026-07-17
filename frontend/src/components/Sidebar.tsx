import { LayoutDashboard, Activity, GitBranch, FileBarChart, Settings, Search, Eye } from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: GitBranch, label: 'Traces', active: false },
  { icon: Activity, label: 'Services', active: false },
  { icon: FileBarChart, label: 'Analytics', active: false },
];

export function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoRow}>
        <div style={styles.logoMark}>
          <Eye size={16} color="#070b09" strokeWidth={2.5} />
        </div>
        <span style={styles.logoText}>CAUSA</span>
      </div>

      <div style={styles.workspace}>
        <div style={styles.workspaceLabel}>Environment</div>
        <div style={styles.workspaceCard}>
          <span style={styles.workspaceDot} />
          Production
        </div>
      </div>

      <div style={styles.searchBox}>
        <Search size={14} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Search traces...</span>
        <span style={styles.kbd}>⌘F</span>
      </div>

      <div style={styles.navLabel}>NAVIGATION</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div key={label} style={active ? styles.navItemActive : styles.navItem}>
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div style={styles.navItem}>
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <div style={styles.userCard}>
          <div style={styles.avatar}>PG</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pranjal Gupta</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@silver</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-subtle)',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' },
  logoMark: {
    width: 28, height: 28, borderRadius: 8,
    background: 'linear-gradient(135deg, var(--accent-green-light), var(--accent-green))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontWeight: 800, fontSize: 17, letterSpacing: 0.5 },
  workspace: { display: 'flex', flexDirection: 'column', gap: 6 },
  workspaceLabel: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, paddingLeft: 4 },
  workspaceCard: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
    borderRadius: 10, padding: '9px 10px', fontSize: 13, fontWeight: 500,
  },
  workspaceDot: { width: 8, height: 8, borderRadius: 99, background: 'var(--accent-green)' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
    borderRadius: 10, padding: '8px 10px',
  },
  kbd: { marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' },
  navLabel: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, marginTop: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
    borderRadius: 10, fontSize: 13.5, color: 'var(--text-secondary)', cursor: 'pointer',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
    borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)',
    background: 'var(--accent-green-dim)', border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
    padding: '10px', borderRadius: 12, background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
  },
  avatar: {
    width: 30, height: 30, borderRadius: 8, background: 'var(--accent-green-dim)',
    color: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700,
  },
};

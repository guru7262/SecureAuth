import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Activity, ArrowUpRight, Bell, Bot, BrainCircuit, CheckCircle2,
  ChevronDown, Globe2, LayoutDashboard, ListFilter, LockKeyhole,
  LogOut, Menu, MoreHorizontal, Network, FileText, BarChart3,
  Radar, Search, Server, Settings, Shield, ShieldAlert, ShieldCheck,
  SlidersHorizontal, Target, Users, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

/* ───── static data ───── */
const traffic = [
  { time: '10:00', normal: 420, bot: 82, suspicious: 34, blocked: 18 },
  { time: '10:10', normal: 510, bot: 96, suspicious: 48, blocked: 24 },
  { time: '10:20', normal: 480, bot: 72, suspicious: 42, blocked: 21 },
  { time: '10:30', normal: 590, bot: 128, suspicious: 66, blocked: 35 },
  { time: '10:40', normal: 620, bot: 110, suspicious: 54, blocked: 29 },
  { time: '10:50', normal: 705, bot: 142, suspicious: 82, blocked: 43 },
  { time: '11:00', normal: 670, bot: 128, suspicious: 72, blocked: 38 },
  { time: '11:10', normal: 790, bot: 154, suspicious: 92, blocked: 51 },
  { time: '11:20', normal: 820, bot: 176, suspicious: 108, blocked: 63 },
  { time: '11:30', normal: 760, bot: 160, suspicious: 86, blocked: 48 },
  { time: '11:40', normal: 880, bot: 190, suspicious: 124, blocked: 72 },
  { time: '11:50', normal: 920, bot: 210, suspicious: 132, blocked: 78 },
]

const threats = [
  { type: 'Brute Force Attempt', ip: '185.220.101.42', endpoint: '/api/auth/login', severity: 'Critical', score: 94, time: '2 min ago', action: 'Blocked' },
  { type: 'Request Flooding', ip: '45.136.22.18', endpoint: '/api/search', severity: 'High', score: 81, time: '8 min ago', action: 'Rate limited' },
  { type: 'Suspicious API Usage', ip: '103.78.54.91', endpoint: '/v2/export', severity: 'Medium', score: 62, time: '14 min ago', action: 'Monitoring' },
  { type: 'Bot Activity', ip: '91.240.118.12', endpoint: '/pricing', severity: 'Low', score: 34, time: '21 min ago', action: 'Allowed' },
]

const navGroups = [
  { label: 'Monitor', items: [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'Real-Time Traffic', icon: Activity }, { name: 'Bot Detection', icon: Bot }, { name: 'Anomaly Detection', icon: BrainCircuit }] },
  { label: 'Protect', items: [{ name: 'Threat Detection', icon: ShieldAlert }, { name: 'Risk Analysis', icon: Target }, { name: 'Rate Limiting', icon: SlidersHorizontal }, { name: 'Blocked IPs', icon: LockKeyhole }] },
  { label: 'Analyze', items: [{ name: 'Traffic Monitoring', icon: Network }, { name: 'Security Logs', icon: FileText }, { name: 'Log Analysis', icon: BarChart3 }, { name: 'Real-Time Analytics', icon: Radar }] },
  { label: 'Manage', items: [{ name: 'Alerts', icon: Bell }, { name: 'User Management', icon: Users }, { name: 'Settings', icon: Settings }] },
]

/* ───── small components ───── */

function Logo({ compact = false }) {
  return (
    <div className="db-logo">
      <div className="db-logo-icon">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="currentColor" />
          <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="var(--bg-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {!compact && (
        <div>
          <div className="db-logo-name">SecureAuth</div>
          <div className="db-logo-sub">SECURITY PLATFORM</div>
        </div>
      )}
    </div>
  )
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`db-badge db-badge-${tone}`}>{children}</span>
}

function Kpi({ title, value, change, icon: Icon, data }) {
  const chart = data.map((v, i) => ({ i, v }))
  return (
    <div className="db-panel db-kpi">
      <div className="db-kpi-top">
        <div className="db-kpi-icon"><Icon size={17} /></div>
        <span className="db-kpi-live">LIVE</span>
      </div>
      <div className="db-kpi-bottom">
        <div>
          <div className="db-kpi-label">{title}</div>
          <div className="db-kpi-value">{value}</div>
          <div className="db-kpi-change"><ArrowUpRight size={12} />{change} <span>vs yesterday</span></div>
        </div>
        <div className="db-kpi-spark">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <Area type="monotone" dataKey="v" stroke="var(--text-primary)" fill="var(--text-primary)" fillOpacity={0.08} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function RiskGauge() {
  const score = 72
  return (
    <div className="db-panel db-risk">
      <div className="db-risk-header">
        <div>
          <div className="db-eyebrow">Risk score engine</div>
          <h3 className="db-section-title">Real-time assessment</h3>
        </div>
        <Badge tone="warning">HIGH RISK</Badge>
      </div>
      <div className="db-risk-body">
        <div className="db-gauge-wrap">
          <div className="db-gauge" />
          <div className="db-gauge-text">
            <span className="db-gauge-score">{score}</span>
            <span className="db-gauge-max">/ 100</span>
          </div>
        </div>
        <div className="db-risk-info">
          <p>System is actively monitoring and applying adaptive protection.</p>
          <div className="db-risk-status">
            <ShieldCheck size={15} /> Rate limit + alert applied
          </div>
        </div>
      </div>
      <div className="db-risk-scale">
        <span>LOW</span><span>MEDIUM</span><span className="db-risk-high">HIGH</span><span className="db-risk-critical">CRITICAL</span>
      </div>
    </div>
  )
}

function TrafficChart() {
  const [range, setRange] = useState('1h')
  return (
    <div className="db-panel db-traffic">
      <div className="db-traffic-header">
        <div>
          <div className="db-eyebrow">Telemetry stream</div>
          <h3 className="db-section-title">Real-time traffic overview</h3>
        </div>
        <div className="db-range-group">
          {['1h', '6h', '24h', '7d'].map(x => (
            <button key={x} onClick={() => setRange(x)} className={`db-range-btn ${range === x ? 'db-range-active' : ''}`}>{x}</button>
          ))}
        </div>
      </div>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={traffic}>
            <defs>
              <linearGradient id="grad-normal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--text-primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--text-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 11, color: 'var(--text-primary)' }} />
            <Area type="monotone" dataKey="normal" name="Normal" stroke="var(--text-primary)" fill="url(#grad-normal)" strokeWidth={2} />
            <Area type="monotone" dataKey="bot" name="Bot traffic" stroke="var(--text-secondary)" fill="transparent" strokeWidth={1.5} />
            <Area type="monotone" dataKey="suspicious" name="Suspicious" stroke="var(--warning)" fill="transparent" strokeWidth={1.5} />
            <Area type="monotone" dataKey="blocked" name="Blocked" stroke="var(--error)" fill="transparent" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="db-legend">
        <span><i className="db-dot" style={{ background: 'var(--text-primary)' }} />Normal</span>
        <span><i className="db-dot" style={{ background: 'var(--text-secondary)' }} />Bot traffic</span>
        <span><i className="db-dot" style={{ background: 'var(--warning)' }} />Suspicious</span>
        <span><i className="db-dot" style={{ background: 'var(--error)' }} />Blocked</span>
      </div>
    </div>
  )
}

function ThreatTable({ compact = false }) {
  return (
    <div className="db-panel db-threat-table">
      <div className="db-table-header">
        <div>
          <div className="db-eyebrow">Detection queue</div>
          <h3 className="db-section-title">{compact ? 'Top threats' : 'Threat detection'}</h3>
        </div>
        <button className="db-icon-btn"><MoreHorizontal size={17} /></button>
      </div>
      <div className="db-table-scroll">
        <table className="db-table">
          <thead>
            <tr>
              <th>Threat type</th><th>Source IP</th><th>Endpoint</th><th>Severity</th><th>Risk score</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {threats.map(t => (
              <tr key={t.ip}>
                <td className="db-td-primary">{t.type}</td>
                <td className="db-td-mono">{t.ip}</td>
                <td className="db-td-mono db-td-muted">{t.endpoint}</td>
                <td><Badge tone={t.severity === 'Critical' ? 'danger' : t.severity === 'High' ? 'warning' : t.severity === 'Medium' ? 'info' : 'safe'}>{t.severity}</Badge></td>
                <td className="db-td-mono">{t.score}</td>
                <td className="db-td-muted">{t.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ───── main views ───── */

function DashboardHome({ onView }) {
  const [tick, setTick] = useState(154782)
  useEffect(() => {
    const id = setInterval(() => setTick(v => v + Math.floor(Math.random() * 9)), 4000)
    return () => clearInterval(id)
  }, [])

  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="db-view">
      <div className="db-view-header">
        <div>
          <div className="db-eyebrow">Command center / {today}</div>
          <h1 className="db-page-title">Security overview</h1>
          <p className="db-page-desc">Monitor, detect, and prevent threats across your web perimeter.</p>
        </div>
        <div className="db-status-pill">
          <span className="db-pulse" /> SYSTEM STATUS: PROTECTED
        </div>
      </div>

      <div className="db-kpi-grid">
        <Kpi title="Total requests" value={tick.toLocaleString()} change="12.5%" icon={Globe2} data={[3, 5, 4, 7, 6, 8, 9]} />
        <Kpi title="Normal traffic" value="142,908" change="9.8%" icon={CheckCircle2} data={[4, 5, 4, 6, 7, 7, 8]} />
        <Kpi title="Bot traffic" value="8,421" change="4.2%" icon={Bot} data={[2, 4, 3, 5, 4, 6, 5]} />
        <Kpi title="Threats detected" value="287" change="18.7%" icon={ShieldAlert} data={[2, 3, 4, 3, 5, 6, 8]} />
        <Kpi title="Blocked requests" value="1,204" change="22.1%" icon={LockKeyhole} data={[3, 5, 4, 7, 6, 8, 9]} />
      </div>

      <div className="db-grid-2col">
        <TrafficChart />
        <RiskGauge />
      </div>

      <div className="db-grid-2col-wide">
        <ThreatTable compact />
        <div className="db-panel db-policy">
          <div className="db-eyebrow">Adaptive protection</div>
          <h3 className="db-section-title">Active response policy</h3>
          <div className="db-policy-list">
            {[['LOW RISK', 'Allow request', 'safe'], ['MEDIUM RISK', 'Monitor session', 'info'], ['HIGH RISK', 'Rate limit + alert', 'warning'], ['CRITICAL RISK', 'Block + alert + log', 'danger']].map(([a, b, c]) => (
              <div key={a} className="db-policy-row">
                <div className="db-policy-left">
                  <span className={`db-policy-dot db-policy-dot-${c}`} />
                  <span className="db-policy-label">{a}</span>
                </div>
                <span className="db-policy-action">{b}</span>
              </div>
            ))}
          </div>
          <button className="db-policy-btn" onClick={() => onView('Risk Analysis')}>View policy details</button>
        </div>
      </div>

      <div className="db-panel db-events">
        <div className="db-events-header">
          <div>
            <div className="db-eyebrow">Event stream</div>
            <h3 className="db-section-title">Recent security events</h3>
          </div>
          <button onClick={() => onView('Security Logs')} className="db-link-btn">View all logs</button>
        </div>
        <div className="db-events-grid">
          {[['Brute force pattern blocked', '185.220.101.42', '2 min ago', 'danger'], ['New anomaly detected', '103.78.54.91', '14 min ago', 'warning'], ['Bot session allowed', '91.240.118.12', '21 min ago', 'safe']].map(([title, ip, time, tone]) => (
            <div key={ip} className="db-event-card">
              <span className={`db-event-icon db-event-icon-${tone}`}><Shield size={14} /></span>
              <div>
                <div className="db-event-title">{title}</div>
                <div className="db-event-meta">{ip} · {time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModuleView({ view }) {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => threats.filter(t => `${t.type} ${t.ip}`.toLowerCase().includes(query.toLowerCase())), [query])
  const titles = { 'Real-Time Traffic': 'Traffic monitoring', 'Bot Detection': 'Bot detection', 'Anomaly Detection': 'ML anomaly detection', 'Threat Detection': 'Threat detection', 'Risk Analysis': 'Risk analysis', 'Rate Limiting': 'Rate limiting', 'Blocked IPs': 'Blocked IP management', 'Traffic Monitoring': 'Traffic intelligence', 'Security Logs': 'Security event logs', 'Log Analysis': 'Log analysis', 'Real-Time Analytics': 'Security analytics', 'Alerts': 'Alert center', 'User Management': 'User management', 'Settings': 'System settings' }
  return (
    <div className="db-view">
      <div>
        <div className="db-eyebrow">SecureAuth / {view}</div>
        <h1 className="db-page-title">{titles[view] || view}</h1>
        <p className="db-page-desc">Live intelligence and controls for your application security perimeter.</p>
      </div>
      <div className="db-kpi-grid-3">
        <Kpi title="Events today" value="2,847" change="8.4%" icon={Activity} data={[2, 4, 3, 5, 4, 7, 6]} />
        <Kpi title="Active signals" value="64" change="2.1%" icon={Radar} data={[4, 3, 5, 4, 6, 5, 7]} />
        <Kpi title="Protection rate" value="99.98%" change="0.6%" icon={ShieldCheck} data={[7, 7, 8, 8, 9, 9, 9]} />
      </div>
      {view === 'Real-Time Traffic' || view === 'Real-Time Analytics' ? (
        <TrafficChart />
      ) : (
        <div className="db-panel db-threat-table">
          <div className="db-table-header">
            <div>
              <div className="db-eyebrow">Live records</div>
              <h3 className="db-section-title">{view === 'Alerts' ? 'Active alerts' : view === 'Bot Detection' ? 'Detected sessions' : 'Security records'}</h3>
            </div>
            <div className="db-table-actions">
              <div className="db-search-mini">
                <Search size={14} />
                <input aria-label="Search records" placeholder="Search records" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <button className="db-icon-btn"><ListFilter size={16} /></button>
            </div>
          </div>
          <div className="db-table-scroll">
            <table className="db-table">
              <thead>
                <tr><th>Event / type</th><th>IP address</th><th>Endpoint</th><th>Risk</th><th>Detected</th><th>Action</th></tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.ip}>
                    <td className="db-td-primary">{t.type}</td>
                    <td className="db-td-mono">{t.ip}</td>
                    <td className="db-td-mono db-td-muted">{t.endpoint}</td>
                    <td><span className={t.score > 80 ? 'db-text-danger' : t.score > 60 ? 'db-text-warning' : 'db-text-safe'}>{t.score}/100</span></td>
                    <td className="db-td-muted">{t.time}</td>
                    <td><Badge tone={t.action === 'Blocked' ? 'danger' : 'info'}>{t.action}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───── main export ───── */

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [view, setView] = useState('Dashboard')
  const [mobile, setMobile] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast({ title: 'Signed out', message: 'You have been signed out successfully.', variant: 'success' })
    } catch {
      toast({ title: 'Error', message: 'Failed to sign out. Please try again.', variant: 'error' })
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] || 'U').toUpperCase()

  return (
    <div className="db-shell">
      {/* sidebar */}
      <aside className={`db-sidebar ${mobile ? 'db-sidebar-open' : ''}`}>
        <div className="db-sidebar-top">
          <Logo />
          <button className="db-mobile-close" onClick={() => setMobile(false)}><X size={18} /></button>
        </div>
        <div className="db-workspace">
          <span className="db-pulse" />Production environment<ChevronDown size={13} />
        </div>
        <nav className="db-nav">
          {navGroups.map(g => (
            <div className="db-nav-group" key={g.label}>
              <div className="db-nav-label">{g.label}</div>
              {g.items.map(({ name, icon: Icon }) => (
                <button key={name} onClick={() => { setView(name); setMobile(false) }} className={`db-nav-item ${view === name ? 'db-nav-active' : ''}`}>
                  <Icon size={16} /><span>{name}</span>
                  {name === 'Alerts' && <em className="db-nav-badge">4</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="db-sidebar-bottom">
          <button className="db-nav-item" onClick={handleLogout}>
            <LogOut size={16} /><span>Sign out</span>
          </button>
          <div className="db-user-chip">
            <div className="db-avatar">{initials}</div>
            <div>
              <div className="db-user-name">{user?.name || user?.email}</div>
              <div className="db-user-role">{user?.email}</div>
            </div>
            <MoreHorizontal size={15} className="db-user-more" />
          </div>
        </div>
      </aside>

      {mobile && <button className="db-scrim" onClick={() => setMobile(false)} aria-label="Close navigation" />}

      {/* main */}
      <section className="db-main">
        <header className="db-topbar">
          <button className="db-mobile-menu" onClick={() => setMobile(true)}><Menu size={19} /></button>
          <div className="db-top-search">
            <Search size={16} />
            <input placeholder="Search events, IPs, endpoints..." aria-label="Global search" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="db-top-actions">
            <div className="db-security-pill"><span className="db-pulse" />Protected</div>
            <button className="db-icon-btn db-icon-btn-rel">
              <Bell size={17} />
              <span className="db-notif-dot" />
            </button>
            <div className="db-top-user">
              <div className="db-avatar db-avatar-sm">{initials}</div>
              <div className="db-top-user-info">
                <div className="db-user-name">{user?.name || user?.email}</div>
                <div className="db-user-role">USER</div>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>
        <main className="db-content">
          {view === 'Dashboard' ? <DashboardHome onView={setView} /> : <ModuleView view={view} />}
        </main>
      </section>
    </div>
  )
}
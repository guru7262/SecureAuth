import { useEffect, useMemo, useState, useCallback } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Activity, ArrowUpRight, Bell, Bot, BrainCircuit, CheckCircle2,
  ChevronDown, Globe2, LayoutDashboard, ListFilter, LockKeyhole,
  LogOut, Menu, MoreHorizontal, Network, FileText, BarChart3,
  Radar, Search, Server, Settings, Shield, ShieldAlert, ShieldCheck,
  SlidersHorizontal, Target, Users, X, Copy, Check, Plus, RefreshCw, Radio, Globe, Terminal, Download
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { websiteApi } from '../lib/api'

/* ───── static dummy data (for Demo Account) ───── */
const dummyTraffic = [
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

const dummyThreats = [
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

/* ───── UI helpers ───── */

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
          <div className="db-logo-name">Sentinel</div>
          <div className="db-logo-sub">SECURITY PLATFORM</div>
        </div>
      )}
    </div>
  )
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`db-badge db-badge-${tone}`}>{children}</span>
}

function Kpi({ title, value, change, icon: Icon, data = [3, 4, 5, 6, 7] }) {
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
          {change && <div className="db-kpi-change"><ArrowUpRight size={12} />{change} <span>vs yesterday</span></div>}
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
          <h3 className="db-section-title">Composite threat score</h3>
        </div>
        <Badge tone="warning">Elevated</Badge>
      </div>
      <div className="db-risk-body">
        <div className="db-gauge-wrap">
          <svg className="db-gauge-svg" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="66" className="db-gauge-bg" />
            <circle cx="80" cy="80" r="66" className="db-gauge-val" strokeDasharray="415" strokeDashoffset={415 - (415 * (score / 100))} />
          </svg>
          <div className="db-gauge-text">
            <span className="db-gauge-num">{score}</span>
            <span className="db-gauge-denom">/ 100</span>
          </div>
        </div>
        <div className="db-risk-metrics">
          <div className="db-risk-row"><span>Bot likelihood</span><strong>68%</strong></div>
          <div className="db-risk-row"><span>Anomaly index</span><strong>0.74</strong></div>
          <div className="db-risk-row"><span>IP reputation</span><strong>Fair (62)</strong></div>
          <div className="db-risk-row"><span>Action threshold</span><strong className="db-text-warning">Rate limit</strong></div>
        </div>
      </div>
    </div>
  )
}

function TrafficChart() {
  return (
    <div className="db-panel db-traffic">
      <div className="db-traffic-header">
        <div>
          <div className="db-eyebrow">Traffic stream</div>
          <h3 className="db-section-title">Real-time classification</h3>
        </div>
        <div className="db-traffic-controls">
          <span className="db-traffic-live"><span className="db-pulse" /> LIVE STREAM</span>
          <button className="db-icon-btn"><ListFilter size={15} /></button>
        </div>
      </div>
      <div className="db-chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dummyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-normal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--text-primary)" stopOpacity={0.2} />
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
            {dummyThreats.map(t => (
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

/* ───── DEMO VIEW (Where all dummy data is shown) ───── */

function DashboardHome({ onView }) {
  const [tick, setTick] = useState(154782)
  useEffect(() => {
    const id = setInterval(() => setTick(v => v + Math.floor(Math.random() * 9)), 4000)
    return () => clearInterval(id)
  }, [])

  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="db-view">
      <div className="db-demo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="db-demo-badge">Dummy Data Active</span>
          <span>You are logged into the <strong>Demo Account</strong>. All simulated charts, bot statistics, and threat logs below represent dummy data.</span>
        </div>
        <Badge tone="info">Demo Mode</Badge>
      </div>

      <div className="db-view-header">
        <div>
          <div className="db-eyebrow">Command center / {today}</div>
          <h1 className="db-page-title">Security overview</h1>
          <p className="db-page-desc">Simulated metrics & live threat detection queue.</p>
        </div>
        <div className="db-status-pill">
          <span className="db-pulse" /> SIMULATED SYSTEM: PROTECTED
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
    </div>
  )
}

function ModuleView({ view }) {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => dummyThreats.filter(t => `${t.type} ${t.ip}`.toLowerCase().includes(query.toLowerCase())), [query])
  const titles = { 'Real-Time Traffic': 'Traffic monitoring', 'Bot Detection': 'Bot detection', 'Anomaly Detection': 'ML anomaly detection', 'Threat Detection': 'Threat detection', 'Risk Analysis': 'Risk analysis', 'Rate Limiting': 'Rate limiting', 'Blocked IPs': 'Blocked IP management', 'Traffic Monitoring': 'Traffic intelligence', 'Security Logs': 'Security event logs', 'Log Analysis': 'Log analysis', 'Real-Time Analytics': 'Security analytics', 'Alerts': 'Alert center', 'User Management': 'User management', 'Settings': 'System settings' }
  return (
    <div className="db-view">
      <div>
        <div className="db-eyebrow">Sentinel / {view}</div>
        <h1 className="db-page-title">{titles[view] || view}</h1>
        <p className="db-page-desc">Simulated intelligence and controls for your application security perimeter.</p>
      </div>
      <div className="db-kpi-grid-3">
        <Kpi title="Events today" value="2,847" change="8.4%" icon={Activity} data={[2, 4, 3, 5, 4, 7, 6]} />
        <Kpi title="Active rules" value="14" change="0%" icon={SlidersHorizontal} data={[3, 3, 3, 3, 3, 3, 3]} />
        <Kpi title="Threat index" value="38 / 100" change="-4.1%" icon={Target} data={[6, 5, 5, 4, 4, 3, 3]} />
      </div>
      <div className="db-panel db-threat-table">
        <div className="db-table-header">
          <div>
            <div className="db-eyebrow">Module data</div>
            <h3 className="db-section-title">{titles[view] || view} - Live view</h3>
          </div>
          <input className="db-table-search" placeholder="Filter..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="db-table-scroll">
          <table className="db-table">
            <thead><tr><th>Type</th><th>IP</th><th>Endpoint</th><th>Score</th><th>Timestamp</th><th>Action</th></tr></thead>
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
    </div>
  )
}

/* ───── REAL USER DASHBOARD (Live and Total Visits Only) ───── */

function RealWebsiteDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [websites, setWebsites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [sdkTab, setSdkTab] = useState('vercel')

  // Registration form inputs
  const [nameInput, setNameInput] = useState('')
  const [domainInput, setDomainInput] = useState('')

  // Fetch website list & stats
  const loadData = useCallback(async (siteId) => {
    try {
      const statsRes = await websiteApi.stats(siteId)
      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats)
        if (!siteId) {
          setSelectedSiteId(statsRes.data.stats.websiteId)
        }
      } else {
        setStats(null)
      }

      const listRes = await websiteApi.list()
      if (listRes.data?.websites) {
        setWebsites(listRes.data.websites)
      }
    } catch (err) {
      console.error('Failed to load website stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(selectedSiteId)
    // Auto-poll every 3.5 seconds to reflect incoming traffic in real-time
    const interval = setInterval(() => {
      loadData(selectedSiteId)
    }, 3500)
    return () => clearInterval(interval)
  }, [selectedSiteId, loadData])

  // Register Website
  const handleRegisterWebsite = async (e) => {
    e.preventDefault()
    if (!domainInput.trim()) {
      toast({ title: 'Validation error', message: 'Domain is required (e.g. mysite.com)', variant: 'error' })
      return
    }

    setRegistering(true)
    try {
      const res = await websiteApi.register({
        name: nameInput.trim() || domainInput.trim(),
        domain: domainInput.trim()
      })
      toast({
        title: 'Website registered!',
        message: 'Your API key has been generated. Use it in the Backend SDK.',
        variant: 'success'
      })
      setShowRegisterForm(false)
      setNameInput('')
      setDomainInput('')
      const newSiteId = res.data?.website?._id
      setSelectedSiteId(newSiteId)
      await loadData(newSiteId)
    } catch (err) {
      toast({ title: 'Registration failed', message: err.message, variant: 'error' })
    } finally {
      setRegistering(false)
    }
  }

  // Copy API Key
  const handleCopyKey = () => {
    if (!stats?.apiKey) return
    navigator.clipboard.writeText(stats.apiKey)
    setCopied(true)
    toast({ title: 'Copied to clipboard', message: 'API Key copied successfully.', variant: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Simulate a test visit with 1-click
  const handleSimulateVisit = async () => {
    if (!stats?.apiKey) return
    setSimulating(true)
    try {
      await websiteApi.sendTraffic({
        apiKey: stats.apiKey,
        path: '/dashboard',
        method: 'GET'
      })
      toast({
        title: 'Test visit sent!',
        message: 'A visit was recorded. Notice the live and total visits increase!',
        variant: 'success'
      })
      await loadData(stats.websiteId)
    } catch (err) {
      toast({ title: 'Error', message: err.message, variant: 'error' })
    } finally {
      setSimulating(false)
    }
  }

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <RefreshCw size={24} className="spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  // If no website registered yet or user wants to register another
  if (!stats || showRegisterForm) {
    return (
      <div className="db-view">
        <div className="db-register-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Register Your Website</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Add your website to get an API key and start tracking live and total visits.</p>
            </div>
          </div>

          <form onSubmit={handleRegisterWebsite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Website Domain *</label>
              <input
                className="form-input"
                placeholder="e.g. myapp.com or localhost:8080"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Site Display Name (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Production Web App"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register Website & Get API Key'}
              </button>
              {stats && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegisterForm(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ───── Real Site Data View ─────
  return (
    <div className="db-view">
      {/* Top Header with Site Info & Actions */}
      <div className="db-view-header">
        <div>
          <div className="db-eyebrow">Website traffic monitor</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="db-page-title" style={{ margin: 0 }}>{stats.name}</h1>
            <Badge tone="safe">{stats.domain}</Badge>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {websites.length > 1 && (
            <select
              className="db-apikey-input"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', cursor: 'pointer' }}
              value={stats.websiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
            >
              {websites.map(w => (
                <option key={w._id} value={w._id}>{w.name} ({w.domain})</option>
              ))}
            </select>
          )}

          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setShowRegisterForm(true)}
          >
            <Plus size={14} /> Add Website
          </button>

          <div className="db-status-pill">
            <span className="db-pulse" /> LIVE TRACKING ACTIVE
          </div>
        </div>
      </div>

      {/* API Key Box */}
      <div className="db-apikey-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Website API Key
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Include this API key in your Backend SDK middleware to report visitor traffic.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={handleSimulateVisit}
              disabled={simulating}
            >
              <Activity size={14} /> {simulating ? 'Recording...' : 'Simulate Test Visit'}
            </button>
          </div>
        </div>

        <div className="db-apikey-row">
          <input
            className="db-apikey-input"
            readOnly
            value={stats.apiKey || 'No key generated'}
          />
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
            onClick={handleCopyKey}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* CORE DATA: Live Visits & Total Visits (Nothing else, just that) */}
      <div className="db-stat-hero-grid">
        <div className="db-stat-hero-card db-stat-hero-live">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Live Visitors
            </div>
            <span className="db-kpi-live" style={{ color: 'var(--success)' }}>
              <span className="db-pulse" /> LIVE NOW
            </span>
          </div>
          <div className="db-stat-hero-val" style={{ color: 'var(--success)' }}>
            {(stats.liveVisits || 0).toLocaleString()}
          </div>
          <div className="db-stat-hero-sub">
            Active requests in the last 5 minutes
          </div>
        </div>

        <div className="db-stat-hero-card db-stat-hero-total">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Visits
            </div>
            <Badge tone="neutral">All-Time</Badge>
          </div>
          <div className="db-stat-hero-val" style={{ color: 'var(--accent-primary)' }}>
            {(stats.totalVisits || 0).toLocaleString()}
          </div>
          <div className="db-stat-hero-sub">
            Cumulative visitor traffic recorded for this site
          </div>
        </div>
      </div>

      {/* Backend & Web SDK Integration Instructions */}
      <div className="db-panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={17} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="db-section-title" style={{ margin: 0 }}>Install Sentinel SDK in Your Site</h3>
          </div>

          {/* Download SDK File Button */}
          <a
            href="/sentinel-traffic.js"
            download="sentinel-traffic.js"
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}
          >
            <Download size={14} /> Download SDK (.js)
          </a>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
          Choose your framework or platform below to see the exact integration code for your website:
        </p>

        {/* Framework Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`btn ${sdkTab === 'vercel' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setSdkTab('vercel')}
          >
            ▲ Vercel / Next.js
          </button>
          <button
            className={`btn ${sdkTab === 'express' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setSdkTab('express')}
          >
            Node.js / Express
          </button>
          <button
            className={`btn ${sdkTab === 'html' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setSdkTab('html')}
          >
            HTML / React / Vite (Script Tag)
          </button>
        </div>

        {/* Tab 1: Vercel / Next.js */}
        {sdkTab === 'vercel' && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              In your Vercel-hosted Next.js app, create or open <code>middleware.js</code> (or <code>middleware.ts</code>) in your root folder:
            </div>
            <div className="db-code-card">
              <pre style={{ margin: 0 }}>
{`// middleware.js (in your Next.js project on Vercel)
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Asynchronously report visit to Sentinel
  fetch('${window.location.origin}/api/traffic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${stats.apiKey}'
    },
    body: JSON.stringify({
      path: request.nextUrl.pathname,
      method: request.method
    })
  }).catch(() => {});

  return NextResponse.next();
}

// Only track actual page and API visits (skip static assets):
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Node.js / Express */}
        {sdkTab === 'express' && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Drop the downloaded <code>sentinel-traffic.js</code> file into your project or install <code>@sentinel-security/node</code>:
            </div>
            <div className="db-code-card">
              <pre style={{ margin: 0 }}>
{`// In your Express server (app.js or server.js):
import express from 'express';
import { sentinelTraffic } from './sentinel-traffic.js';

const app = express();

// Attach Sentinel Traffic tracking:
app.use(sentinelTraffic({
  apiKey: '${stats.apiKey}',
  endpoint: '${window.location.origin}/api/traffic'
}));

app.get('/', (req, res) => res.send('Welcome to my website!'));`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: HTML / React / Vite on Vercel */}
        {sdkTab === 'html' && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              For static sites, React, Vue, or HTML pages hosted on Vercel, simply paste this script tag into your <code>index.html</code>:
            </div>
            <div className="db-code-card">
              <pre style={{ margin: 0 }}>
{`<!-- Paste inside <head> or right before </body> in your index.html -->
<script
  src="${window.location.origin}/sentinel-traffic.js"
  data-api-key="${stats.apiKey}"
  async
></script>`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Recent Visits Table */}
      <div className="db-panel db-threat-table">
        <div className="db-table-header">
          <div>
            <div className="db-eyebrow">Real-time log</div>
            <h3 className="db-section-title">Recent Site Visits</h3>
          </div>
          <button
            className="db-icon-btn"
            onClick={() => loadData(stats.websiteId)}
            title="Refresh visits"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="db-table-scroll">
          <table className="db-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Method</th>
                <th>Request Path</th>
                <th>Visitor IP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!stats.recentVisits || stats.recentVisits.length === 0) ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No visits recorded yet. Hit <strong>Simulate Test Visit</strong> above or run your backend with the SDK!
                  </td>
                </tr>
              ) : (
                stats.recentVisits.map((v, i) => (
                  <tr key={i}>
                    <td className="db-td-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <Badge tone={v.method === 'POST' ? 'warning' : 'safe'}>{v.method}</Badge>
                    </td>
                    <td className="db-td-mono db-td-primary">{v.path}</td>
                    <td className="db-td-mono db-td-muted">{v.ip}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.75rem' }}>
                        <span className="db-pulse" /> Recorded
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ───── Main Dashboard Component ───── */

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [view, setView] = useState('Dashboard')
  const [mobile, setMobile] = useState(false)

  const isDemo = Boolean(user?.isDemo || user?.email?.toLowerCase().includes('demo'))

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
          <span className="db-pulse" />
          {isDemo ? 'Demo Mode (Simulated)' : 'Production Environment'}
          <ChevronDown size={13} />
        </div>
        <nav className="db-nav">
          {navGroups.map(g => (
            <div className="db-nav-group" key={g.label}>
              <div className="db-nav-label">{g.label}</div>
              {g.items.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => { setView(name); setMobile(false) }}
                  className={`db-nav-item ${view === name ? 'db-nav-active' : ''}`}
                >
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
              <div className="db-user-role">{isDemo ? 'DEMO USER' : user?.email}</div>
            </div>
            <MoreHorizontal size={15} className="db-user-more" />
          </div>
        </div>
      </aside>

      {mobile && <button className="db-scrim" onClick={() => setMobile(false)} aria-label="Close navigation" />}

      {/* main content */}
      <section className="db-main">
        <header className="db-topbar">
          <button className="db-mobile-menu" onClick={() => setMobile(true)}><Menu size={19} /></button>
          <div className="db-top-search">
            <Search size={16} />
            <input placeholder="Search registered websites, IPs, endpoints..." aria-label="Global search" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="db-top-actions">
            <div className="db-security-pill">
              <span className="db-pulse" />{isDemo ? 'Demo Data' : 'Live Site Active'}
            </div>
            <button className="db-icon-btn db-icon-btn-rel">
              <Bell size={17} />
              <span className="db-notif-dot" />
            </button>
            <div className="db-top-user">
              <div className="db-avatar db-avatar-sm">{initials}</div>
              <div className="db-top-user-info">
                <div className="db-user-name">{user?.name || user?.email}</div>
                <div className="db-user-role">{isDemo ? 'DEMO ACCOUNT' : 'SITE OWNER'}</div>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        <main className="db-content">
          {/* If user is in Demo mode: show the full simulated dashboard with all dummy data */}
          {isDemo ? (
            view === 'Dashboard' ? <DashboardHome onView={setView} /> : <ModuleView view={view} />
          ) : (
            /* If real user: show their registered website with API Key, Live & Total Visits */
            <RealWebsiteDashboard />
          )}
        </main>
      </section>
    </div>
  )
}

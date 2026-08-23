import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    failedLogins: 0,
    recentEvents: [],
  })

  useEffect(() => {
    if (!authLoading) {
      setLoading(false)
    }
  }, [authLoading])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: 'Signed out',
        message: 'You have been signed out successfully.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Error',
        message: 'Failed to sign out. Please try again.',
        variant: 'error',
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16M16 16L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>SecureAuth</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
              {user?.name || user?.email}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Overview
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatCard
              title="Total Events"
              value={stats.totalEvents.toLocaleString()}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <StatCard
              title="Failed Logins"
              value={stats.failedLogins.toLocaleString()}
              variant="warning"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            />
          </div>
        </section>

        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
            }}>
              Phase 1 — Demo Data
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Event</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>IP</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { event: 'Signup', user: 'john@example.com', ip: '192.168.1.1', time: '2 min ago', status: 'success' },
                  { event: 'Login', user: 'jane@example.com', ip: '10.0.0.45', time: '15 min ago', status: 'success' },
                  { event: 'Login Failed', user: 'bob@example.com', ip: '172.16.0.1', time: '1 hour ago', status: 'failed' },
                  { event: 'Login', user: 'alice@example.com', ip: '192.168.1.100', time: '3 hours ago', status: 'success' },
                  { event: 'Signup', user: 'charlie@example.com', ip: '10.0.1.23', time: '5 hours ago', status: 'success' },
                ].map((item, i) => (
                  <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--border-primary)' : 'none' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.event}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.user}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.ip}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.time}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: item.status === 'success' ? 'var(--success-glow)' : 'var(--error-glow)',
                        color: item.status === 'success' ? 'var(--success)' : 'var(--error)',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'currentColor',
                        }} />
                        {item.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Next Steps
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            <NextStepCard
              title="Connect Your App"
              description="Add the SecureBase SDK to your application and start sending auth events via our simple REST API."
              actionLabel="View API Docs"
              actionHref="/docs"
            />
            <NextStepCard
              title="Configure Scoring"
              description="Set up rule-based trust scoring for your users and IPs. Define thresholds for rate limiting."
              actionLabel="Configure Rules"
              actionHref="/settings/scoring"
            />
            <NextStepCard
              title="Import Existing Users"
              description="Optionally import your existing user base to give them baseline trust scores based on account age."
              actionLabel="Start Import"
              actionHref="/settings/import"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, variant = 'default' }) {
  const colors = {
    default: { bg: 'var(--accent-glow)', color: 'var(--accent-primary)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' },
    success: { bg: 'var(--success-glow)', color: 'var(--success)' },
  }
  const { bg, color } = colors[variant]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {value}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {title}
      </p>
    </div>
  )
}

function NextStepCard({ title, description, actionLabel, actionHref }) {
  return (
    <a href={actionHref} style={{
      display: 'block',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      textDecoration: 'none',
      transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    }} onMouseEnter={(e) => {
      e.target.style.borderColor = 'var(--border-secondary)'
      e.target.style.boxShadow = 'var(--shadow-md)'
    }} onMouseLeave={(e) => {
      e.target.style.borderColor = 'var(--border-primary)'
      e.target.style.boxShadow = 'none'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
        {description}
      </p>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--accent-primary)',
      }}>
        {actionLabel}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
}
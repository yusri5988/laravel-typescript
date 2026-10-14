import { AppLayout } from '../components/AppLayout'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <AppLayout>
      {({ user }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.025em' }}>
                  Dashboard
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'rgba(52, 199, 89, 0.12)',
                    color: '#248a3d',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(52, 199, 89, 0.25)',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34c759' }} />
                  Edge Online
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#6e6e73', letterSpacing: '-0.01em' }}>
                Welcome back, <strong style={{ color: '#1d1d1f' }}>{user.name}</strong>. Here is your system status.
              </p>
            </div>

            <Link
              to="/profile"
              className="apple-btn-secondary"
              style={{ textDecoration: 'none', height: '36px' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>System Settings</span>
            </Link>
          </div>

          {/* User Overview Summary Banner */}
          <div
            className="apple-card"
            style={{
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Active Identity
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '13px', color: '#6e6e73', marginTop: '2px' }}>
                {user.email} &bull; Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="apple-badge apple-badge-blue">
                {user.role.toUpperCase()}
              </span>
              <span className="apple-badge apple-badge-green">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Inset Group: System Specifications & Architecture */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#86868b',
                marginBottom: '10px',
                paddingLeft: '4px',
              }}
            >
              System &amp; Architecture Details
            </div>

            <div className="apple-inset-group">
              <div className="apple-inset-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>Backend Runtime</div>
                  <div style={{ fontSize: '12px', color: '#86868b' }}>Edge Worker with Hono routing</div>
                </div>
                <div style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: 500 }}>Cloudflare Workers</div>
              </div>

              <div className="apple-inset-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>Database Binding</div>
                  <div style={{ fontSize: '12px', color: '#86868b' }}>Serverless relational SQLite layer</div>
                </div>
                <div style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: 500 }}>Cloudflare D1 (hono-laravel)</div>
              </div>

              <div className="apple-inset-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>Session Management</div>
                  <div style={{ fontSize: '12px', color: '#86868b' }}>JWT token with stateful session store</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34c759' }} />
                  <span style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: 500 }}>Active</span>
                </div>
              </div>

              <div className="apple-inset-row">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>Frontend Client</div>
                  <div style={{ fontSize: '12px', color: '#86868b' }}>React 19 SPA built with Vite</div>
                </div>
                <div style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: 500 }}>Vite 8</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
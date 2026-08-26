import { AppLayout } from '../components/AppLayout'

function Dashboard() {
  return (
    <AppLayout>
      {({ user }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
          {/* Dashboard Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Dashboard
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #a7f3d0',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Online
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Welcome back, <strong style={{ color: '#0f172a' }}>{user.name}</strong> ({user.email}). Here is what is happening with your services today.
            </p>
          </div>

          {/* Metric / Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="cf-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Authenticated User
                </span>
                <span className="cf-badge-role" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                  {user.role}
                </span>
              </div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="cf-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Edge Architecture
                </span>
                <span style={{ display: 'inline-flex', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                Hono + D1 + Workers
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Global serverless SQLite edge layer
              </div>
            </div>

            <div className="cf-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Security & Sessions
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10b981' }}>Active</span>
              </div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                JWT + D1 Store
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Instant session revocation enabled
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

export default Dashboard
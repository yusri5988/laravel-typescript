import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, getToken, clearToken, type UserResource } from '../lib/api'

interface AuthContextType {
  user: UserResource
  setUser: (user: UserResource) => void
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AppLayout')
  }
  return context
}

interface AppLayoutProps {
  children: ReactNode | ((context: AuthContextType) => ReactNode)
}

function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </svg>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function SidebarToggleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="3" />
      <path d="M9 3v18" />
    </svg>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<UserResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true })
      return
    }

    api
      .me()
      .then(setUser)
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleLogout() {
    try {
      await api.logout()
    } catch {
      // Local session is cleared either way
    }
    clearToken()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="cf-loading-state">
        <div className="cf-spinner" />
        <p style={{ color: '#86868b', fontSize: '13px', fontWeight: 500 }}>Connecting to edge…</p>
      </div>
    )
  }

  if (!user) return null

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const contextValue: AuthContextType = { user, setUser, handleLogout }

  return (
    <AuthContext.Provider value={contextValue}>
      <div className="cf-dashboard-layout">
        {/* Apple Translucent Frosted Glass Navbar */}
        <header className="cf-navbar">
          <div className="cf-navbar-left">
            <button
              type="button"
              className="cf-sidebar-toggle-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              aria-label="Toggle sidebar"
            >
              <SidebarToggleIcon />
            </button>

            <Link to="/dashboard" className="cf-navbar-brand">
              <div className="cf-brand-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1.5" />
                  <rect width="7" height="7" x="14" y="3" rx="1.5" />
                  <rect width="7" height="7" x="14" y="14" rx="1.5" />
                  <rect width="7" height="7" x="3" y="14" rx="1.5" />
                </svg>
              </div>
              <span className="cf-brand-text">Product Inc.</span>
            </Link>
          </div>

          <div className="cf-navbar-right">
            <div className="cf-user-menu">
              <Link
                to="/profile"
                className="cf-user-avatar"
                title={`Settings (${user.email})`}
              >
                {userInitial}
              </Link>
              <button className="cf-btn-logout" onClick={handleLogout} title="Sign Out">
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Shell with macOS/iPadOS Style Sidebar */}
        <div className="cf-dashboard-shell">
          {sidebarOpen && (
            <div
              className="cf-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <aside className={`cf-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="cf-sidebar-section">
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#86868b',
                  padding: '4px 12px 8px 12px',
                }}
              >
                Navigation
              </div>
              <nav className="cf-sidebar-nav">
                <Link
                  to="/dashboard"
                  className={`cf-sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <GridIcon />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className={`cf-sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <SettingsIcon />
                  <span>System Settings</span>
                </Link>
              </nav>
            </div>

            <div className="cf-sidebar-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34c759' }} />
                <span>Cloudflare Edge &bull; D1 Online</span>
              </div>
            </div>
          </aside>

          {/* Main View Area */}
          <main className="cf-content-area">
            {typeof children === 'function' ? children(contextValue) : children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}

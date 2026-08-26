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

function SquaresPlusIcon({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function Cog6ToothIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<UserResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) return null

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const contextValue: AuthContextType = { user, setUser, handleLogout }

  return (
    <AuthContext.Provider value={contextValue}>
      <div className="cf-dashboard-layout">
        {/* Top Navbar */}
        <header className="cf-navbar">
          <div className="cf-navbar-left">
            <button
              type="button"
              className="cf-sidebar-toggle-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/dashboard" className="cf-navbar-brand">
              <div className="cf-brand-icon-wrap">
                <SquaresPlusIcon />
              </div>
              <span className="cf-brand-text">Product Inc.</span>
            </Link>
          </div>

          <div className="cf-navbar-right">
            <div className="cf-user-menu">
              <Link to="/profile" className="cf-user-avatar" title={`Edit Profile (${user.email})`}>
                {userInitial}
              </Link>
              <button className="cf-btn-logout" onClick={handleLogout} title="Sign out of account">
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main Shell with Slidable SideNav */}
        <div className="cf-dashboard-shell">
          {/* Backdrop overlay on small screens */}
          {sidebarOpen && (
            <div
              className="cf-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Slidable SideNav Menu */}
          <aside className={`cf-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="cf-sidebar-section">
              <nav className="cf-sidebar-nav">
                <Link
                  to="/dashboard"
                  className={`cf-sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  <HomeIcon />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className={`cf-sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  <Cog6ToothIcon />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>

            <div className="cf-sidebar-footer">
              <span>Product Inc. &bull; v0.1.0</span>
            </div>
          </aside>

          {/* Content Area */}
          <main className="cf-content-area">
            {typeof children === 'function' ? children(contextValue) : children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}




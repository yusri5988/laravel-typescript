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
              title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/dashboard" className="cf-navbar-brand">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
              <span>Cloudflare</span>
            </Link>
          </div>

          <div className="cf-navbar-right">
            <div className="cf-user-menu">
              <Link to="/profile" className="cf-user-avatar" title={`Edit profil (${user.email})`}>
                {userInitial}
              </Link>
              <button className="cf-btn-logout" onClick={handleLogout} title="Sign out of account">
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main Shell with Slidable Sidebar */}
        <div className="cf-dashboard-shell">
          {/* Backdrop overlay on small screens */}
          {sidebarOpen && (
            <div
              className="cf-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Slidable Sidebar Menu */}
          <aside className={`cf-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="cf-sidebar-section">
              <div className="cf-sidebar-label">Manage</div>
              <nav className="cf-sidebar-nav">
                <Link
                  to="/dashboard"
                  className={`cf-sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className={`cf-sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Profile</span>
                </Link>
              </nav>
            </div>

            <div className="cf-sidebar-footer">
              <span>Hono Laravel v0.1.0</span>
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

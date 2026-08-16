import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, ApiErrorException } from '../lib/api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<Record<string, string[]> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const { token } = await api.login(email, password)
      setToken(token)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setError(err.errors ?? { _request: [err.message] })
      } else {
        setError({ _request: ['Something went wrong. Please try again.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cf-auth-container">
      <div className="cf-auth-brand">
        <div className="cf-auth-brand-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        </div>
        <span className="cf-auth-brand-title">Cloudflare</span>
      </div>

      <div className="cf-auth-card">
        <div className="cf-auth-header">
          <h1>Log in to Dashboard</h1>
          <p>Sign in to manage your Workers, D1 database, and API services.</p>
        </div>

        {error?._request && (
          <div className="cf-alert-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error._request.join(' ')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="cf-form-group">
            <label className="cf-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={`cf-input ${error?.email ? 'has-error' : ''}`}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {error?.email && <span className="cf-field-error">{error.email.join(' ')}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`cf-input ${error?.password ? 'has-error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error?.password && <span className="cf-field-error">{error.password.join(' ')}</span>}
          </div>

          <button type="submit" className="cf-btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="cf-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#ffffff' }} />
                <span>Signing in...</span>
              </>
            ) : (
              'Log In'
            )}
          </button>

          <div className="cf-auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="cf-link">
              Sign up
            </Link>
          </div>
        </form>
      </div>

      <div className="cf-auth-meta">
        <p>&copy; {new Date().getFullYear()} Cloudflare Workers &bull; Hono Laravel Architecture</p>
      </div>
    </div>
  )
}

export default Login
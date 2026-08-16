import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, ApiErrorException } from '../lib/api'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<Record<string, string[]> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await api.register({ name, email, password })
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
          <h1>Create your account</h1>
          <p>Get started with Hono Workers, D1 database & edge services.</p>
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
            <label className="cf-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className={`cf-input ${error?.name ? 'has-error' : ''}`}
              placeholder="Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
            {error?.name && <span className="cf-field-error">{error.name.join(' ')}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={`cf-input ${error?.email ? 'has-error' : ''}`}
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {error?.email && <span className="cf-field-error">{error.email.join(' ')}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label" htmlFor="password">
              Password (min. 8 characters)
            </label>
            <input
              id="password"
              type="password"
              className={`cf-input ${error?.password ? 'has-error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            {error?.password && <span className="cf-field-error">{error.password.join(' ')}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label" htmlFor="passwordConfirmation">
              Confirm password
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              className={`cf-input ${error?.passwordConfirmation ? 'has-error' : ''}`}
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            {error?.passwordConfirmation && (
              <span className="cf-field-error">{error.passwordConfirmation.join(' ')}</span>
            )}
          </div>

          <button type="submit" className="cf-btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="cf-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#ffffff' }} />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="cf-auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="cf-link">
              Log in
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

export default Register
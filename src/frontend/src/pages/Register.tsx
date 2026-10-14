import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, ApiErrorException } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError('')

    if (!name || !email || !password || !passwordConfirmation) {
      setGeneralError('Please fill in all required fields.')
      return
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({ passwordConfirmation: ['Passwords do not match.'] })
      return
    }

    setIsLoading(true)

    try {
      await api.register({
        name,
        email,
        password,
      })
      const { token } = await api.login(email, password)
      setToken(token)
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setGeneralError(err.message)
        if (err.errors) setFieldErrors(err.errors)
      } else {
        setGeneralError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Apple App Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(145deg, #0071e3 0%, #005bb5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -4px rgba(0, 113, 227, 0.35), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
        </div>

        {/* Apple Segmented Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            padding: '3px',
            borderRadius: '12px',
            marginBottom: '24px',
            maxWidth: '280px',
            marginInline: 'auto',
          }}
        >
          <Link
            to="/login"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '6px 14px',
              borderRadius: '9px',
              color: '#6e6e73',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 140ms ease',
            }}
          >
            Sign In
          </Link>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '6px 14px',
              borderRadius: '9px',
              backgroundColor: '#ffffff',
              color: '#1d1d1f',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              cursor: 'default',
            }}
          >
            Sign Up
          </div>
        </div>

        {/* Card Container */}
        <div
          className="apple-card"
          style={{
            padding: '32px 30px',
            borderRadius: '22px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.07), 0 2px 8px rgba(0, 0, 0, 0.02)',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {isSuccess ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '24px 0',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(52, 199, 89, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34c759',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                Account Created
              </h2>
              <p style={{ fontSize: '13px', color: '#86868b' }}>
                Setting up your environment and launching dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} noValidate>
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.25,
                    marginBottom: '6px',
                  }}
                >
                  Create your Account
                </h1>
                <p style={{ fontSize: '13.5px', color: '#86868b' }}>
                  Start building on the edge with Hono Laravel.
                </p>
              </div>

              {generalError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 59, 48, 0.08)',
                    border: '1px solid rgba(255, 59, 48, 0.22)',
                    color: '#d70015',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    marginBottom: '16px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{generalError}</span>
                </div>
              )}

              <div className="apple-input-group">
                <label className="apple-label" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Jane Appleseed"
                  className={`apple-input ${fieldErrors.name ? 'has-error' : ''}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                {fieldErrors.name && (
                  <span className="apple-error-text">{fieldErrors.name[0]}</span>
                )}
              </div>

              <div className="apple-input-group">
                <label className="apple-label" htmlFor="register-email">
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="jane@example.com"
                  className={`apple-input ${fieldErrors.email ? 'has-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                {fieldErrors.email && (
                  <span className="apple-error-text">{fieldErrors.email[0]}</span>
                )}
              </div>

              <div className="apple-input-group">
                <label className="apple-label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="At least 8 characters"
                  className={`apple-input ${fieldErrors.password ? 'has-error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {fieldErrors.password && (
                  <span className="apple-error-text">{fieldErrors.password[0]}</span>
                )}
              </div>

              <div className="apple-input-group">
                <label className="apple-label" htmlFor="register-password-confirmation">
                  Confirm Password
                </label>
                <input
                  id="register-password-confirmation"
                  type="password"
                  placeholder="Repeat your password"
                  className={`apple-input ${fieldErrors.passwordConfirmation ? 'has-error' : ''}`}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {fieldErrors.passwordConfirmation && (
                  <span className="apple-error-text">{fieldErrors.passwordConfirmation[0]}</span>
                )}
              </div>

              <div style={{ marginTop: '22px' }}>
                <button
                  type="submit"
                  className="apple-btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%', height: '44px' }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="cf-spinner"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderWidth: '2px',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderTopColor: '#ffffff',
                        }}
                      />
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '20px',
                  paddingTop: '18px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                  fontSize: '13px',
                  color: '#86868b',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#0071e3',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#86868b',
            lineHeight: 1.6,
          }}
        >
          By signing up, you agree to Product Inc.’s{' '}
          <Link to="#" style={{ color: '#6e6e73', textDecoration: 'underline' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="#" style={{ color: '#6e6e73', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
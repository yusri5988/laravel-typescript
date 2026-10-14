import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, ApiErrorException } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginFailed, setLoginFailed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault()

    if (!email || !password) {
      setLoginFailed(true)
      setErrorMessage('Please enter both your email and password.')
      return
    }

    setIsLoading(true)
    setLoginFailed(false)
    setErrorMessage('')

    try {
      const { token } = await api.login(email, password)
      setToken(token)
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 900)
    } catch (err) {
      setLoginFailed(true)
      if (err instanceof ApiErrorException) {
        const errorText = err.errors?.email?.join(' ') || err.errors?.password?.join(' ') || err.message
        setErrorMessage(errorText || 'Incorrect credentials. Please verify and try again.')
      } else {
        setErrorMessage('Could not sign in with these credentials. Try again.')
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
        padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Apple-style App Icon */}
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
              <rect width="7" height="7" x="3" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="14" rx="1.5" />
              <rect width="7" height="7" x="3" y="14" rx="1.5" />
            </svg>
          </div>
        </div>

        {/* Apple Segmented Controller Switcher */}
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
            Sign In
          </div>
          <Link
            to="/register"
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
            Sign Up
          </Link>
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
                Signed In
              </h2>
              <p style={{ fontSize: '13px', color: '#86868b' }}>
                Opening your dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} noValidate>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
                  Sign in with your account
                </h1>
                <p style={{ fontSize: '13.5px', color: '#86868b' }}>
                  Enter your credentials to continue to Product Inc.
                </p>
              </div>

              {loginFailed && errorMessage && (
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
                    marginBottom: '18px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="apple-input-group">
                <label className="apple-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  className={`apple-input ${loginFailed && !email ? 'has-error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLoginFailed(false)
                  }}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="apple-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="apple-label" htmlFor="login-password">
                    Password
                  </label>
                  <Link
                    to="#"
                    style={{
                      fontSize: '12px',
                      color: '#0071e3',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  className={`apple-input ${loginFailed ? 'has-error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setLoginFailed(false)
                  }}
                  autoComplete="current-password"
                  required
                />
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
                      <span>Signing in…</span>
                    </>
                  ) : (
                    'Continue'
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
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#0071e3',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Create one now
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Apple Minimal Legal Footer */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#86868b',
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree to Product Inc.’s{' '}
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
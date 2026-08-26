import { useState, type FormEvent, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, ApiErrorException } from '../lib/api'

const COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'

const COLUMN_MIN_WIDTH = 240

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
}

const cardWrap: CSSProperties = {
  width: '100%',
  maxWidth: 960,
  marginInline: 'auto',
}

const coverImage: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '320px',
  maxHeight: '520px',
  objectFit: 'cover',
  display: 'block',
  borderRadius: '12px',
}

const LOGIN_SPLIT_CSS = `
.login-split-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.login-split-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${COLUMN_MIN_WIDTH}px, 1fr));
  gap: 24px;
  align-items: stretch;
  padding: 24px;
  container-type: inline-size;
  container-name: login-split;
}

.login-split-form-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
}

.login-split-image {
  width: 100%;
  height: 100%;
  display: flex;
  order: 0;
}

.login-split-image-inner {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #f1f5f9;
}

@container login-split (max-width: 511px) {
  .login-split-grid {
    padding: 16px;
    gap: 18px;
  }
  .login-split-image {
    order: -1;
  }
  .login-split-image-inner {
    max-height: 180px;
  }
}

.login-brand-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.9375rem;
  color: #0f172a;
  margin-bottom: 18px;
}

.login-brand-icon {
  color: #f38020;
  display: flex;
  align-items: center;
}

.login-title-group {
  margin-bottom: 18px;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
}

.login-input-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-text-input {
  width: 100%;
  padding: 9px 12px;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #ffffff;
  color: #0f172a;
  transition: all 0.15s ease;
  outline: none;
}

.login-text-input:focus {
  border-color: #f38020;
  box-shadow: 0 0 0 2px rgba(243, 128, 32, 0.15);
}

.login-text-input.input-error {
  border-color: #ef4444;
}

.login-text-input.input-error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.login-error-msg {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
}

.login-forgot-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.login-forgot-link {
  font-size: 0.75rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s ease;
}

.login-forgot-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

.login-submit-btn {
  width: 100%;
  padding: 9px 14px;
  background-color: #f38020;
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.15s ease, transform 0.05s ease;
  margin-top: 6px;
}

.login-submit-btn:hover:not(:disabled) {
  background-color: #e56a0c;
}

.login-submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.login-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-divider-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.login-divider-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e2e8f0;
}

.login-divider-text {
  position: relative;
  background: #ffffff;
  padding: 0 10px;
  font-size: 0.75rem;
  color: #94a3b8;
}

.login-social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.login-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.login-social-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.login-footer-text {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 18px;
}

.login-footer-link {
  color: #f38020;
  font-weight: 600;
  text-decoration: none;
}

.login-footer-link:hover {
  text-decoration: underline;
}

.login-terms-text {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 16px;
  line-height: 1.5;
}

.login-terms-link {
  color: #64748b;
  text-decoration: underline;
}

.login-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 12px;
  gap: 8px;
}

.login-empty-icon {
  color: #10b981;
}

.login-empty-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0f172a;
}

.login-empty-desc {
  font-size: 0.8125rem;
  color: #64748b;
}
`

function SquaresPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-0.93 2.73 1.05.08 2.07-.48 2.67-1.23z" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

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
      setErrorMessage('Please enter both email and password.')
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
      }, 1200)
    } catch (err) {
      setLoginFailed(true)
      if (err instanceof ApiErrorException) {
        const errorText = err.errors?.email?.join(' ') || err.errors?.password?.join(' ') || err.message
        setErrorMessage(errorText || 'Incorrect credentials. Try again.')
      } else {
        setErrorMessage('Incorrect password or credentials. Try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      <style>{LOGIN_SPLIT_CSS}</style>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={cardWrap}>
          <div className="login-split-card">
            <div className="login-split-grid">
              {/* Form Side */}
              <div className="login-split-form-col">
                <div>
                  {/* Brand */}
                  <div className="login-brand-header">
                    <div className="login-brand-icon">
                      <SquaresPlusIcon />
                    </div>
                    <span>Product Inc.</span>
                  </div>

                  {isSuccess ? (
                    <div className="login-empty-state">
                      <div className="login-empty-icon">
                        <CheckCircleIcon />
                      </div>
                      <h2 className="login-empty-title">You're signed in</h2>
                      <p className="login-empty-desc">Redirecting to your dashboard…</p>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} noValidate>
                      <div className="login-title-group">
                        <h2 className="login-title">Welcome back</h2>
                        <p className="login-subtitle">Login to your Product Inc. account</p>
                      </div>

                      <div className="login-input-group">
                        <input
                          type="email"
                          placeholder="name@company.com"
                          className={`login-text-input ${loginFailed && !email ? 'input-error' : ''}`}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setLoginFailed(false)
                          }}
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="login-input-group">
                        <input
                          type="password"
                          placeholder="Enter your password"
                          className={`login-text-input ${loginFailed ? 'input-error' : ''}`}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setLoginFailed(false)
                          }}
                          autoComplete="current-password"
                          required
                        />
                        {loginFailed && (
                          <>
                            <span className="login-error-msg">
                              {errorMessage || 'Incorrect password. Try again.'}
                            </span>
                            <div className="login-forgot-wrap">
                              <Link to="#" className="login-forgot-link">
                                Forgot your password?
                              </Link>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className="cf-spinner"
                              style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#ffffff' }}
                            />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          'Login'
                        )}
                      </button>

                      <div className="login-divider-wrap">
                        <div className="login-divider-line" />
                        <span className="login-divider-text">Or continue with</span>
                      </div>

                      <div className="login-social-grid">
                        <button
                          type="button"
                          className="login-social-btn"
                          onClick={() => alert('Apple sign-in is not configured yet.')}
                        >
                          <AppleLogo />
                          <span>Apple</span>
                        </button>
                        <button
                          type="button"
                          className="login-social-btn"
                          onClick={() => alert('Google sign-in is not configured yet.')}
                        >
                          <GoogleLogo />
                          <span>Google</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {!isSuccess && (
                  <div className="login-footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="login-footer-link">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

              {/* Cover Image Side */}
              <div className="login-split-image">
                <div className="login-split-image-inner">
                  <img
                    style={coverImage}
                    src={COVER_IMAGE_URL}
                    alt="Two people working at a desk"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-terms-text">
          By clicking continue, you agree to our{' '}
          <Link to="#" className="login-terms-link">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="#" className="login-terms-link">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
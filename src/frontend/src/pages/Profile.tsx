import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken, ApiErrorException, type UserResource } from '../lib/api'
import { AppLayout } from '../components/AppLayout'

interface ProfileFormProps {
  user: UserResource
  setUser: (user: UserResource) => void
}

function ProfileContent({ user, setUser }: ProfileFormProps) {
  const navigate = useNavigate()
  // Profile update form state
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({})

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({})

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileSuccess(null)
    setProfileError(null)
    setProfileFieldErrors({})

    try {
      const updated = await api.updateProfile({ name, email })
      setUser(updated)
      setProfileSuccess('Profile changes saved successfully.')
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setProfileError(err.message)
        if (err.errors) setProfileFieldErrors(err.errors)
      } else {
        setProfileError('Failed to update profile. Please try again.')
      }
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordSuccess(null)
    setPasswordError(null)
    setPasswordFieldErrors({})

    try {
      const res = await api.updatePassword({ currentPassword, password, passwordConfirmation })
      setPasswordSuccess(res.message || 'Password updated successfully. Please sign in again.')
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      setTimeout(() => {
        clearToken()
        navigate('/login', { replace: true })
      }, 1500)
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setPasswordError(err.message)
        if (err.errors) setPasswordFieldErrors(err.errors)
      } else {
        setPasswordError('Failed to update password. Please check your credentials.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleDeleteAccount(e: FormEvent) {
    e.preventDefault()
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      await api.deleteAccount(deletePassword)
      clearToken()
      navigate('/login', { replace: true })
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setDeleteError(err.message)
      } else {
        setDeleteError('Failed to delete account. Please verify your password.')
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.025em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '2px', letterSpacing: '-0.01em' }}>
          Manage your Apple-style profile credentials, passwords, and security.
        </p>
      </div>

      {/* Apple User Hero Card (like macOS Apple ID banner) */}
      <div className="apple-card profile-hero-card">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071e3 0%, #42a5f5 100%)',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(0, 113, 227, 0.35)',
            border: '2px solid #ffffff',
            flexShrink: 0,
          }}
        >
          {userInitial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
              {user.name}
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 113, 227, 0.1)',
                color: '#0071e3',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {user.role}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#6e6e73', marginTop: '2px', wordBreak: 'break-all' }}>
            {user.email}
          </div>
        </div>
      </div>

      {/* 1. Profile Information Section */}
      <div className="apple-card" style={{ padding: '28px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 113, 227, 0.1)',
              color: '#0071e3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
              Personal Information
            </h3>
            <p style={{ fontSize: '12.5px', color: '#86868b' }}>
              Update your public display name and contact email address.
            </p>
          </div>
        </div>

        {profileSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(52, 199, 89, 0.12)',
              border: '1px solid rgba(52, 199, 89, 0.25)',
              color: '#248a3d',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '18px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
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
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="apple-input-group">
            <label className="apple-label" htmlFor="profile-name">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              className={`apple-input ${profileFieldErrors.name ? 'has-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {profileFieldErrors.name && (
              <span className="apple-error-text">{profileFieldErrors.name[0]}</span>
            )}
          </div>

          <div className="apple-input-group">
            <label className="apple-label" htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              className={`apple-input ${profileFieldErrors.email ? 'has-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {profileFieldErrors.email && (
              <span className="apple-error-text">{profileFieldErrors.email[0]}</span>
            )}
          </div>

          <div className="profile-submit-wrap">
            <button
              type="submit"
              className="apple-btn-primary"
              disabled={profileLoading}
              style={{ width: 'auto', minWidth: '130px' }}
            >
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Password Section */}
      <div className="apple-card" style={{ padding: '28px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(88, 86, 214, 0.1)',
              color: '#5856d6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
              Sign-In &amp; Security
            </h3>
            <p style={{ fontSize: '12.5px', color: '#86868b' }}>
              Ensure your account is using a strong password for protection.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(52, 199, 89, 0.12)',
              border: '1px solid rgba(52, 199, 89, 0.25)',
              color: '#248a3d',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '18px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
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
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="apple-input-group">
            <label className="apple-label" htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••••••"
              className={`apple-input ${passwordFieldErrors.currentPassword ? 'has-error' : ''}`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            {passwordFieldErrors.currentPassword && (
              <span className="apple-error-text">{passwordFieldErrors.currentPassword[0]}</span>
            )}
          </div>

          <div className="apple-input-group">
            <label className="apple-label" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="At least 8 characters"
              className={`apple-input ${passwordFieldErrors.password ? 'has-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordFieldErrors.password && (
              <span className="apple-error-text">{passwordFieldErrors.password[0]}</span>
            )}
          </div>

          <div className="apple-input-group">
            <label className="apple-label" htmlFor="new-password-confirmation">
              Confirm New Password
            </label>
            <input
              id="new-password-confirmation"
              type="password"
              placeholder="Repeat new password"
              className={`apple-input ${passwordFieldErrors.passwordConfirmation ? 'has-error' : ''}`}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            {passwordFieldErrors.passwordConfirmation && (
              <span className="apple-error-text">{passwordFieldErrors.passwordConfirmation[0]}</span>
            )}
          </div>

          <div className="profile-submit-wrap">
            <button
              type="submit"
              className="apple-btn-primary"
              disabled={passwordLoading}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Account Deletion (Apple Style Sheet/Card) */}
      <div
        className="apple-card"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          borderColor: 'rgba(255, 59, 48, 0.25)',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#d70015', letterSpacing: '-0.01em' }}>
              Delete Account
            </h3>
            <p style={{ fontSize: '12.5px', color: '#86868b', marginTop: '2px' }}>
              Permanently delete your account and all associated edge session records.
            </p>
          </div>

          <button
            type="button"
            className="apple-btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account…
          </button>
        </div>
      </div>

      {/* Apple Modal Confirmation Sheet */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false)
          }}
        >
          <div
            className="apple-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '28px',
              borderRadius: '22px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5, marginBottom: '18px' }}>
              This action cannot be undone. All of your edge resources and data will be permanently wiped.
            </p>

            {deleteError && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  color: '#d70015',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  marginBottom: '14px',
                }}
              >
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount}>
              <div className="apple-input-group" style={{ marginBottom: '18px' }}>
                <label className="apple-label" htmlFor="delete-password">
                  Confirm Password
                </label>
                <input
                  id="delete-password"
                  type="password"
                  placeholder="Enter your password to proceed"
                  className="apple-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="apple-btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                    setDeleteError(null)
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-danger"
                  disabled={deleteLoading || !deletePassword}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete Forever'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  return (
    <AppLayout>
      {({ user, setUser }) => <ProfileContent user={user} setUser={setUser} />}
    </AppLayout>
  )
}

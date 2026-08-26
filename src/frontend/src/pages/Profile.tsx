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
      setProfileSuccess('Profile updated successfully!')
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
      setPasswordSuccess(res.message || 'Password updated successfully. Please log in again.')
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      setTimeout(() => {
        clearToken()
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      if (err instanceof ApiErrorException) {
        setPasswordError(err.message)
        if (err.errors) setPasswordFieldErrors(err.errors)
      } else {
        setPasswordError('Failed to change password. Please try again.')
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
        setDeleteError('Failed to delete account. Please check your password.')
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="cf-page-header">
        <div className="cf-page-title-group">
          <h1>User Profile</h1>
          <p className="cf-page-subtitle">
            Manage your account information, password, and security settings.
          </p>
        </div>
      </div>

      <div className="cf-profile-grid">
        {/* 1. Profile Information */}
        <div className="cf-card">
          <div className="cf-card-header">
            <div className="cf-card-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="cf-card-title">Profile Information</h2>
              <p className="cf-card-desc">Update your display name and email address.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="cf-form">
            {profileSuccess && (
              <div className="cf-alert-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="cf-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{profileError}</span>
              </div>
            )}

            <div className="cf-form-group">
              <label htmlFor="profile-name" className="cf-label">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className={`cf-input ${profileFieldErrors.name ? 'has-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {profileFieldErrors.name && (
                <span className="cf-field-error">{profileFieldErrors.name.join(', ')}</span>
              )}
            </div>

            <div className="cf-form-group">
              <label htmlFor="profile-email" className="cf-label">Email Address</label>
              <input
                id="profile-email"
                type="email"
                className={`cf-input ${profileFieldErrors.email ? 'has-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {profileFieldErrors.email && (
                <span className="cf-field-error">{profileFieldErrors.email.join(', ')}</span>
              )}
            </div>

            <div className="cf-profile-meta-row">
              <span className="cf-badge-role">Role: {user.role.toUpperCase()}</span>
              <span className="cf-text-muted-sm">Registered on: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="cf-card-footer">
              <button type="submit" className="cf-btn-primary cf-btn-fit" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Change Password */}
        <div className="cf-card">
          <div className="cf-card-header">
            <div className="cf-card-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="cf-card-title">Change Password</h2>
              <p className="cf-card-desc">Make sure your account uses a long, random password.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="cf-form">
            {passwordSuccess && (
              <div className="cf-alert-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="cf-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{passwordError}</span>
              </div>
            )}

            <div className="cf-form-group">
              <label htmlFor="current-password" className="cf-label">Current Password</label>
              <input
                id="current-password"
                type="password"
                className={`cf-input ${passwordFieldErrors.currentPassword ? 'has-error' : ''}`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              {passwordFieldErrors.currentPassword && (
                <span className="cf-field-error">{passwordFieldErrors.currentPassword.join(', ')}</span>
              )}
            </div>

            <div className="cf-form-group">
              <label htmlFor="new-password" className="cf-label">New Password</label>
              <input
                id="new-password"
                type="password"
                className={`cf-input ${passwordFieldErrors.password ? 'has-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              {passwordFieldErrors.password && (
                <span className="cf-field-error">{passwordFieldErrors.password.join(', ')}</span>
              )}
            </div>

            <div className="cf-form-group">
              <label htmlFor="confirm-password" className="cf-label">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className={`cf-input ${passwordFieldErrors.passwordConfirmation ? 'has-error' : ''}`}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
              {passwordFieldErrors.passwordConfirmation && (
                <span className="cf-field-error">{passwordFieldErrors.passwordConfirmation.join(', ')}</span>
              )}
            </div>

            <div className="cf-card-footer">
              <button type="submit" className="cf-btn-primary cf-btn-fit" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Danger Zone / Delete Account */}
        <div className="cf-card cf-card-danger">
          <div className="cf-card-header">
            <div className="cf-card-header-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div>
              <h2 className="cf-card-title text-danger">Delete Account</h2>
              <p className="cf-card-desc">Delete your account and all session data permanently.</p>
            </div>
          </div>

          <div className="cf-danger-body">
            <p className="cf-danger-warning">
              Once your account is deleted, all information and sessions will be permanently canceled. This action cannot be undone.
            </p>

            {!showDeleteModal ? (
              <button
                type="button"
                className="cf-btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="cf-delete-confirm-box">
                {deleteError && (
                  <div className="cf-alert-error">
                    <span>{deleteError}</span>
                  </div>
                )}
                <label htmlFor="delete-account-password" className="cf-label">
                  Enter your password to confirm account deletion:
                </label>
                <div className="cf-delete-action-row">
                  <input
                    id="delete-account-password"
                    type="password"
                    className="cf-input"
                    placeholder="Account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="cf-btn-danger cf-btn-fit"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    className="cf-btn-secondary"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeletePassword('')
                      setDeleteError(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Profile() {
  return (
    <AppLayout>
      {({ user, setUser }) => <ProfileContent user={user} setUser={setUser} />}
    </AppLayout>
  )
}

export default Profile

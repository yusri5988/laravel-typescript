import { AppLayout } from '../components/AppLayout'

function Dashboard() {
  return (
    <AppLayout>
      {({ user }) => (
        <>
          <div className="cf-page-header">
            <div className="cf-page-title-group">
              <h1>Dashboard</h1>
              <p className="cf-page-subtitle">
                Welcome back, {user.name} ({user.email})
              </p>
            </div>
          </div>

          <div className="cf-content-body">
            {/* Content template */}
          </div>
        </>
      )}
    </AppLayout>
  )
}

export default Dashboard
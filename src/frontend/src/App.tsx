import { useState, useEffect } from 'react'

interface ApiResponse {
  data?: unknown
  message?: string
}

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/')
      .then(res => res.json() as Promise<ApiResponse>)
      .then(data => {
        setApiData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>Hono Laravel Template</h1>
        <p className="subtitle">Backend + Frontend on Same Port</p>
      </header>

      <main className="main">
        <section className="status-section">
          <h2>API Status</h2>
          {loading && <p className="status loading">Loading...</p>}
          {error && <p className="status error">Error: {error}</p>}
          {!loading && !error && apiData && (
            <div className="api-response">
              <pre>{JSON.stringify(apiData, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="info-section">
          <h2>Project Structure</h2>
          <ul>
            <li><strong>Backend:</strong> Hono + TypeScript + Drizzle ORM</li>
            <li><strong>Frontend:</strong> React + Vite</li>
            <li><strong>Database:</strong> Cloudflare D1</li>
            <li><strong>Port:</strong> 8787 (both frontend & backend)</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App

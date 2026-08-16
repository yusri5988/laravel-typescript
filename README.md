# Hono Laravel Template (Fullstack)

Hono + TypeScript + Drizzle ORM + React frontend — all on the same port.

## Scaffold From npm

Create and run a local project without cloning the repository:

```powershell
mkdir my-hono-app
cd my-hono-app
npx hono-laravel setup
npm run dev
```

The setup command installs dependencies, creates a local `.dev.vars` file, builds frontend assets, and applies local D1 migrations. The application runs at `http://127.0.0.1:8787`.

## Architecture

- **Backend**: Hono (Cloudflare Workers) + TypeScript + Drizzle ORM + D1
- **Frontend**: React + Vite (TypeScript)
- **Port**: 8787 for frontend and backend in local Worker mode

## Project Structure

```
src/
|-- app/                    # Backend application layers
|   |-- Controllers/
|   |-- Services/
|   |-- Repositories/
|   |-- Middleware/
|   `-- Requests/
|-- routes/                 # API routes (/api/*)
|-- frontend/               # React + Vite frontend
|   |-- src/
|   |   |-- App.tsx         # Main React component
|   |   |-- main.tsx        # Entry point
|   |   `-- index.css       # Styles
|   |-- index.html          # HTML entry
|   `-- vite.config.ts      # Vite configuration
`-- src/dist/               # Built frontend (generated)
```

## Development

```bash
# Install dependencies
npm install

# Build assets and start the local Worker
npm run dev

# Optional Vite frontend with API proxy
npm run dev:frontend  # Frontend at http://localhost:5173

# Start Wrangler local Worker directly
npm run dev:backend   # Application at http://127.0.0.1:8787
```

The default `npm run dev` builds `src/dist/`, then starts Wrangler with local D1 and the configured `ASSETS` binding. Vite mode remains available when hot reload is needed.

## Build & Deploy

```bash
# Build frontend and backend
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Build assets and start the local Worker on port 8787 |
| `npm run dev:frontend` | Start frontend dev server only |
| `npm run dev:backend` | Start backend dev server only |
| `npm run build` | Build frontend and typecheck backend |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm test` | Run tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:migrate` | Apply D1 migrations locally |
| `npm run db:push` | Push schema changes (local prototyping only) |

## Testing

```bash
npm test
npm run test:watch
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout (authenticated) |
| GET | `/api/users/me` | Get current user (authenticated) |
| GET | `/api/users` | List users (admin only) |
| PATCH | `/api/users/password` | Change password (authenticated) |
| DELETE | `/api/users/profile` | Delete account (authenticated) |

## Frontend Demo

The React frontend includes:
- API status check (fetches from `/api/`)
- Loading/error states
- Project structure info
- Clean, modern UI

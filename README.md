# Hono Laravel Template (Fullstack)

Hono + TypeScript + Drizzle ORM + React frontend — all on the same port.

## Architecture

- **Backend**: Hono (Cloudflare Workers) + TypeScript + Drizzle ORM + D1
- **Frontend**: React + Vite (TypeScript)
- **Port**: 8787 for both frontend and backend

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
`-- dist/                   # Built frontend (generated)
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (frontend on 5173, backend on 8787 with proxy)
npm run dev

# Or start separately
npm run dev:frontend  # Frontend at http://localhost:5173
npm run dev:backend   # Backend at http://localhost:8787
```

**Note**: In development mode, the frontend runs on port 5173 with a proxy to the backend on 8787. This is for easier hot-reload during development. The production build serves everything from one port.

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
| `npm run dev` | Start both frontend and backend |
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

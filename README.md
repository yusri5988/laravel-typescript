# Hono Laravel

Laravel-inspired backend starter built with Hono, TypeScript, Drizzle ORM, Cloudflare D1, and Cloudflare Workers.

It keeps Laravel's predictable request flow without trying to recreate Laravel internally:

```text
Route → Request Schema → Controller → Service → Repository → Drizzle → D1
```

## Features

- Hono Worker entrypoint
- Laravel-inspired `routes`, `Controllers`, `Services`, `Repositories`, `Requests`, `Middleware`, and `Exceptions`
- TypeScript types generated from Wrangler configuration
- Drizzle schema and committed D1 migrations
- PBKDF2 password hashing through Workers Web Crypto
- JWT authentication using a Cloudflare secret
- Breeze-inspired authentication endpoints for registration, login, logout, profile, and password changes
- Zod request validation
- Configurable CORS origin
- Workers Logs and Traces configuration
- Unit tests and Worker-compatible test foundation

## Project structure

```text
src/
├── app/
│   ├── Controllers/      # HTTP handlers; keep them thin
│   ├── Exceptions/       # HTTP exceptions and global error handling
│   ├── Middleware/       # auth, request ID, and cross-cutting concerns
│   ├── Models/           # application types and resources
│   ├── Repositories/     # Drizzle/D1 queries
│   ├── Requests/         # Zod validation schemas
│   ├── Services/         # business logic
│   ├── Env.ts            # Hono environment types (Bindings & Variables)
│   └── app.ts            # application bootstrap
├── config/               # application configuration
├── database/
│   ├── migrations/       # committed SQL migrations
│   ├── schema/           # Drizzle schema source of truth
│   └── seeders/           # local/demo seed data
├── helpers/              # response helpers
├── routes/               # modular endpoint definitions (api, web, auth, users)
└── index.ts              # Worker entrypoint
tests/
AGENTS.md                # architecture rules for contributors and coding agents
wrangler.jsonc           # Worker and D1 configuration
worker-configuration.d.ts # generated binding types
```

## Local development

Requirements: Node.js 20+, npm, and Wrangler authentication only for remote operations.

```bash
npm install
copy .env.example .dev.vars       # PowerShell
npm run typegen
npm run db:migrate
npm run db:seed
npm run dev
```

The local Worker runs at `http://localhost:8787`.

## D1 setup and deployment

Create the remote database and follow the printed instructions:

```powershell
npm run setup:d1 -- -DatabaseName hono-laravel
```

Then configure the secret and deploy:

```bash
npx wrangler secret put JWT_SECRET
npm run typegen
npm run db:migrate:remote
npm run deploy
```

`database_id` is intentionally a placeholder in `wrangler.jsonc`. A GitHub template cannot create a user's Cloudflare resources during clone, so the one-time D1 creation and secret setup remain required.

For remote demo data only:

```bash
npm run db:seed:remote
```

Do not use the demo seed password in a real deployment.

## Database workflow

Edit `src/database/schema/index.ts`, then generate and apply a migration:

```bash
npm run db:generate
npm run db:migrate
```

Use `npm run db:push` only for local prototyping. Commit generated migration files for all shared environments.

## Authentication demo

The sample API includes:

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/users/me
PATCH /api/users/profile
PATCH /api/users/password
```

Login expects an email and password. Passwords are stored using PBKDF2 with a random per-user salt. JWT signing requires `JWT_SECRET` from `.dev.vars` locally or `wrangler secret put JWT_SECRET` remotely.

The seeded local users use:

```text
alice@example.com / password123
bob@example.com   / password123
```

Replace or remove this demo module when starting a real project.

### Breeze-inspired API flow

The authentication module follows the same published-code idea as Laravel Breeze:
routes are modular, request validation is separated into `app/Requests`, HTTP handling stays in controllers, business rules stay in services, and D1 queries stay in repositories. Password reset and email verification token tables are included in the schema; an email provider must be connected before those tokens can be delivered to users.

## Tests and checks

```bash
npm run typecheck
npm test
npm audit --omit=dev --audit-level=high
npx wrangler deploy --dry-run
```

## Adding a resource

Follow the existing module pattern:

1. Add the Drizzle table to `src/database/schema`.
2. Generate and commit a migration.
3. Add row/resource types in `src/app/Models`.
4. Add database queries in a Repository.
5. Add business rules in a Service.
6. Add Zod schemas in `src/app/Requests`.
7. Add thin Controller handlers.
8. Register endpoints in `src/routes`.
9. Add unit and Worker-level tests.

See [AGENTS.md](./AGENTS.md) for the mandatory architecture guidelines.

## License

MIT

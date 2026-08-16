# Hono + React + Cloudflare D1 — Master Architecture & SOP Standard

Use this guide as the default architecture and operating standard for building new projects from scratch.

This architecture standard is designed for:

- Cloudflare Workers
- Hono
- React + Vite
- Cloudflare D1
- Drizzle ORM
- TypeScript
- Zod
- Vitest
- Cloudflare Workers deployment (manual dulu, GitHub kemudian — lihat Section 41)
- AI-agent-assisted development

The goal is consistency, maintainability, predictable AI-agent behavior, and production-safe development.

---

## 1. Core Principles

Every project built using this architecture MUST follow these principles:

1. Keep controllers thin.
2. Keep business logic inside services.
3. Keep all database access inside repositories.
4. Validate all external input with Zod.
5. Never return raw database rows directly to API consumers.
6. Never expose secrets, password hashes, tokens, stack traces, or internal errors.
7. Prefer explicit code over hidden magic.
8. Avoid unnecessary dependencies.
9. Keep frontend and backend responsibilities separate.
10. Every persistent feature must include tests.
11. Never modify unrelated code during a feature change.
12. Never manually edit an already-deployed migration.
13. Production behavior must be reproducible from Git.

---

## 2. Project Initialization from Scratch (Code Baru)

Do NOT copy from existing project folders. Every new project must be coded from scratch with a fresh, clean repository while strictly complying with all architectural SOPs.

### Step-by-Step Initialization

1. **Create Directory and Initialize Git**:

```powershell
mkdir NewProjectName
cd NewProjectName
git init
```

2. **Initialize Base Configuration Files**:
   Create the required root configuration files matching the architectural standards:
   - `package.json` — with scripts and dependencies (`hono`, `drizzle-orm`, `zod`, `react`, `vite`, `@cloudflare/workers-types`, `wrangler`, `vitest`, etc.)
   - `wrangler.jsonc` — Worker name, D1 database bindings, compatibility flags, and static assets
   - `tsconfig.json` & `drizzle.config.ts`
   - `vite.config.ts` & `vitest.config.ts`
   - `.env.example` & `.gitignore`
   - `AGENTS.md` & `README.md`

3. **Install Dependencies**:

```powershell
npm install
```

4. **Scaffold Directory Structure & Architecture Layers**:
   Build the backend, frontend, database, and test directories strictly according to the structure defined in Section 4.

5. **Generate Bindings and Verify**:

```powershell
npm run typegen
npm run typecheck
npm test
```

---

## 3. Essential Project Configuration Files

When coding a new project from scratch, ensure these foundational files are defined and configured properly:

| File | Purpose & Configuration |
|------|-------------------------|
| `package.json` | Project identity (`name`, `description`, `version`), standard scripts, and runtime/dev dependencies |
| `wrangler.jsonc` | Worker `name`, D1 `database_name`, bindings (D1, KV, R2, DO, AI, Queues, Hyperdrive), `vars.APP_NAME`, `secrets.required`, `observability.enabled`, and assets configuration |
| `drizzle.config.ts` | Drizzle ORM configuration pointing to schema (`src/database/schema/index.ts`) and migrations |
| `tsconfig.json` | TypeScript configuration with strict mode and path aliases (e.g. `@/*`) |
| `vite.config.ts` | React + Vite frontend configuration and dev server proxy |
| `vitest.config.ts` | Vitest testing setup for unit tests and Cloudflare Worker integration tests |
| `.env.example` | Template for environment variable keys only (never real secrets) |
| `src/config/app.ts` | Centralized application configuration, URLs, and constants |
| `worker-configuration.d.ts` | Generated Cloudflare environment types (`npm run typegen`) |
| `AGENTS.md` | Architecture rules and SOP documentation for AI coding agents |

---

## 4. Project Structure

```text
NewProjectName/
├── .gitignore
├── .env.example
├── AGENTS.md
├── README.md
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── wrangler.jsonc
├── worker-configuration.d.ts
│
├── scripts/
│   └── setup.ps1
│
├── src/
│   ├── index.ts
│   │
│   ├── app/
│   │   ├── app.ts
│   │   ├── Env.ts
│   │   │
│   │   ├── Controllers/
│   │   │   ├── AuthController.ts
│   │   │   └── UserController.ts
│   │   │
│   │   ├── DurableObjects/
│   │   │   ├── RateLimiter.ts
│   │   │   └── __init__.ts
│   │   │
│   │   ├── Exceptions/
│   │   │   ├── AuthenticationException.ts
│   │   │   ├── AuthorizationException.ts
│   │   │   ├── DuplicateUserEmailError.ts
│   │   │   ├── Handler.ts
│   │   │   ├── HttpException.ts
│   │   │   ├── NotFoundException.ts
│   │   │   └── ValidationException.ts
│   │   │
│   │   ├── Middleware/
│   │   │   ├── Auth.ts
│   │   │   ├── Global.ts
│   │   │   └── RateLimit.ts
│   │   │
│   │   ├── Models/
│   │   │   └── User.ts
│   │   │
│   │   ├── Repositories/
│   │   │   ├── AuthRepository.ts
│   │   │   ├── RateLimitRepository.ts
│   │   │   └── UserRepository.ts
│   │   │
│   │   ├── Requests/
│   │   │   ├── RequestValidator.ts
│   │   │   ├── AuthRequest.ts
│   │   │   └── UserRequest.ts
│   │   │
│   │   └── Services/
│   │       ├── AppServiceProvider.ts
│   │       ├── AuthService.ts
│   │       └── UserService.ts
│   │
│   ├── config/
│   │   └── app.ts
│   │
│   ├── database/
│   │   ├── schema/
│   │   │   └── index.ts
│   │   ├── migrations/
│   │   │   └── *.sql
│   │   └── seeders/
│   │       └── seed.sql
│   │
│   ├── helpers/
│   │   ├── response.ts
│   │   ├── pagination.ts
│   │   └── logger.ts
│   │
│   ├── routes/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   ├── users.ts
│   │   └── web.ts
│   │
│   └── frontend/
│       ├── index.html
│       ├── public/                     # Direct public files only
│       │   ├── favicon.ico
│       │   ├── robots.txt
│       │   └── manifest.webmanifest
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── index.css
│           │
│           ├── assets/                 # Source assets imported by React/Vite
│           │   ├── images/
│           │   ├── icons/
│           │   ├── logos/
│           │   ├── fonts/
│           │   └── illustrations/
│           │
│           ├── components/
│           │   ├── common/
│           │   ├── forms/
│           │   ├── layout/
│           │   └── ui/
│           │
│           ├── features/
│           │   ├── auth/
│           │   └── users/
│           │
│           ├── hooks/
│           ├── lib/
│           ├── pages/
│           ├── routes/
│           ├── services/
│           ├── types/
│           └── utils/
│
├── dist/                               # Generated by Vite/build; never edit manually
│   ├── index.html
│   └── assets/
│
└── tests/
    ├── app.test.ts
    ├── auth-service.test.ts
    ├── user-service.test.ts
    └── worker.integration.test.ts
```

---

## 5. Mandatory Backend Request Flow

Every persistent feature MUST follow this exact flow:

```text
HTTP Request
   ↓
Route
   ↓
Request Schema / Zod
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Drizzle ORM
   ↓
Cloudflare D1
```

Responses must flow back through safe application resource types.

```text
D1 row
   ↓
Repository
   ↓
Service mapping
   ↓
Safe Resource
   ↓
Controller
   ↓
API Response
```

Raw database rows MUST NOT be returned directly to controllers or clients when they contain internal fields.

---

## 6. Layer Contracts

### Routes

Routes are responsible only for HTTP route definitions and middleware composition.

Rules:

- One file per resource.
- Use `new Hono<AppEnv>()`.
- Attach middleware at route level.
- Call controller handlers.
- Do not perform business logic.
- Do not import Drizzle.
- Do not import database schema.
- Do not access D1 directly.
- Do not instantiate repositories manually.
- Do not create service instances directly unless through the approved service provider.

Example:

```ts
routes.get(
  '/:id',
  auth,
  ...UserController.show
)
```

---

### Requests

Every endpoint accepting input MUST have a Zod schema.

Rules:

- One request file per resource or domain.
- Use explicit schemas per action.
- Validate `json`, `param`, `query`, and `header` input.
- Never trust `c.req.json()`, query params, route params or headers without validation.
- Request validation errors return HTTP `422`.

Expected validation response:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Invalid email address."]
  }
}
```

---

### Controllers

Controllers are HTTP adapters only.

Responsibilities:

1. Read validated input.
2. Resolve the required service.
3. Call service method.
4. Convert application output to HTTP response.

Controllers MUST NOT:

- query D1;
- import schema tables;
- call Drizzle;
- contain major business rules;
- hash passwords;
- generate raw SQL;
- perform long data transformations.

---

### Services

Services contain business logic.

Rules:

- No Hono `Context` dependency.
- No `Request` or `Response` dependency.
- Accept plain typed values.
- Return plain typed values.
- Enforce business rules.
- Enforce application invariants.
- Map database rows to safe resources.
- Coordinate multiple repositories when needed.
- Throw typed application/domain exceptions.

A service should be reusable outside HTTP.

---

### Repositories

Repositories own persistence logic.

Rules:

- All Drizzle queries belong here.
- All D1 persistence logic belongs here.
- Return typed database rows or persistence results.
- Use schema inference:

```ts
typeof users.$inferSelect
typeof users.$inferInsert
```

- Do not return HTTP responses.
- Do not depend on Hono Context.
- Throw typed persistence/domain errors when appropriate.

---

### Models

Models define domain-facing types.

A model SHOULD contain:

- raw database row type;
- insert/update types where useful;
- safe API resource type;
- mapping helper when useful.

Sensitive properties such as these MUST NOT appear in public resource types:

```text
passwordHash
refreshTokenHash
secret
internalNotes
privateKey
```

---

## 7. Naming Convention

All projects MUST use one naming convention consistently.

### TypeScript

Classes and components:

```text
PascalCase
UserService
UserRepository
LoginPage
UserCard
```

Variables and functions:

```text
camelCase
currentUser
getUserById
```

Constants:

```text
UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS
DEFAULT_PAGE_SIZE
```

Files containing classes:

```text
PascalCase.ts
UserService.ts
UserRepository.ts
```

Route files:

```text
kebab-case.ts
user-sessions.ts
password-resets.ts
```

React feature folders:

```text
kebab-case
user-profile/
order-history/
```

### Database

Tables:

```text
snake_case plural
users
user_sessions
order_items
```

Columns:

```text
snake_case
created_at
updated_at
user_id
```

Foreign keys:

```text
<singular_resource>_id
user_id
order_id
```

### API Routes

Use plural REST resource names:

```text
/api/users
/api/orders
/api/order-items
```

Avoid verbs unless the endpoint represents an explicit action:

```text
POST /api/auth/login
POST /api/auth/logout
POST /api/orders/:id/cancel
```

---

## 8. Database Rules

The Drizzle schema is the database source of truth.

Location:

```text
src/database/schema/index.ts
```

Rules:

1. Do not manually change production tables outside migrations.
2. Generate migrations from schema changes.
3. Never manually edit a migration that has already been applied remotely.
4. Never delete an already-deployed migration.
5. If production needs a correction, create a new migration.
6. Keep migrations committed to Git.
7. Review generated SQL before applying remotely.
8. Never run destructive remote migrations casually.
9. Back up/export important production data before risky schema changes.

Workflow:

```powershell
# 1. Update schema
# src/database/schema/index.ts

# 2. Generate migration
npm run db:generate

# 3. Review generated SQL

# 4. Apply locally
npm run db:migrate

# 5. Run tests
npm test

# 6. Apply remote migration
npm run db:migrate:remote
```

---

## 9. D1 Setup

D1 ialah SQL database serverless Cloudflare (SQLite), dibina untuk query global pantas. Ia menyokong transaksi penuh, foreign keys, unique constraints, dan indexes.

### 9.1 Cipta Database

```powershell
npx wrangler d1 create your-db-name
```

Wrangler akan output `binding`, `database_name`, dan `database_id`. Apabila ditanya `Would you like Wrangler to add it on your behalf?`, pilih `Yes` untuk auto-tambah binding ke `wrangler.jsonc`.

Config yang terhasil:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-db-name",
      "database_id": "<unique-ID-for-your-database>"
    }
  ]
}
```

Nota nama database:
- < 32 aksara, guna dashes (`-`) bukan spaces.
- Deskriptif untuk use-case + environment: `staging-db-web`, `production-db-backend`.
- Nama DB tidak dirujuk dalam kod — kod guna `binding`.

### 9.2 Binding

- Nama binding mesti valid JavaScript variable name: `MY_DB`, `productionDB`.
- Akses dalam Worker: `env.<BINDING_NAME>`.
- Type: `D1Database` (dihasilkan oleh `npm run typegen` ke `worker-configuration.d.ts`).

### 9.3 Jalankan SQL (Local vs Remote)

```powershell
# Local (development) — default
npx wrangler d1 execute your-db-name --local --file=./schema.sql
npx wrangler d1 execute your-db-name --local --command="SELECT * FROM users"

# Remote (production)
npx wrangler d1 execute your-db-name --remote --file=./schema.sql
npx wrangler d1 execute your-db-name --remote --command="SELECT * FROM users"
```

Aturan: uji `--local` dulu, sahkan data, baru `--remote`.

### 9.4 Query dalam Worker

Wajib guna **prepared statements** (`prepare()` + `bind()`) — elak SQL injection:

```ts
const { results } = await env.DB
  .prepare("SELECT * FROM users WHERE email = ?")
  .bind(email)
  .run();
```

- `prepare()` — query dengan placeholder `?`.
- `bind()` — bind nilai secara selamat.
- `run()` — laksana dan pulang rows.
- JANGAN interpolasi nilai user terus ke dalam SQL string.

### 9.5 Migrations

```powershell
npm run typegen
npm run db:migrate          # local
npm run db:migrate:remote   # remote — selepas local verified
```

Naming convention migrasi D1: `<timestamp>_<name>.sql`.

### 9.6 Delete (hati-hati)

```powershell
npx wrangler d1 delete your-db-name
npx wrangler delete your-worker-name
```

Menghapus D1 akan menghentikan aplikasi yang bergantung padanya.

---

## 10. Environment, Vars, Secrets and Bindings

Environment configuration MUST be separated by purpose.

### Local-only development values

Use:

```text
.env
```

Never commit `.env`.

### Example environment file

Commit:

```text
.env.example
```

It should contain keys only, never real secrets.

Example:

```env
APP_NAME=
APP_URL=
JWT_SECRET=
```

### Cloudflare non-secret variables

Use `vars` in `wrangler.jsonc`.

Example:

```jsonc
{
  "vars": {
    "APP_NAME": "Example App",
    "APP_ENV": "production"
  }
}
```

### Cloudflare secrets

Secrets MUST use Wrangler secret storage:

```powershell
npx wrangler secret put JWT_SECRET
```

Never store production secrets in:

- Git;
- `wrangler.jsonc`;
- source files;
- frontend code;
- `.env.example`.

### Bindings

Bindings seperti:

```text
D1
KV
R2
Queues
Durable Objects
Workers AI
Hyperdrive
Analytics Engine
```

wajib ditype dalam `src/app/Env.ts` (atau guna generated `worker-configuration.d.ts`).

### 10.1 Senarai Binding Cloudflare (Config + Type)

Semua binding diisytihar dalam `wrangler.jsonc`, dan diakses dalam Worker sebagai `env.<BINDING_NAME>`:

#### D1 (SQL database)

```jsonc
{
  "d1_databases": [
    { "binding": "DB", "database_name": "your-db", "database_id": "<id>" }
  ]
}
```

Type: `D1Database`. API: `prepare()`, `bind()`, `run()`, `first()`, `batch()`, `dump()`.

#### KV (key-value global)

```jsonc
{
  "kv_namespaces": [
    { "binding": "KV", "id": "<namespace-id>" }
  ]
}
```

Type: `KVNamespace`. API: `get()`, `put()`, `list()`, `delete()`.

#### R2 (object storage)

```jsonc
{
  "r2_buckets": [
    { "binding": "BUCKET", "bucket_name": "my-bucket" }
  ]
}
```

Type: `R2Bucket`. API: `get()`, `put()`, `delete()`, `list()`.

#### Queues (messaging)

```jsonc
{
  "queues": {
    "producers": [
      { "queue": "my-queue", "binding": "MY_QUEUE" }
    ],
    "consumers": [
      { "queue": "my-queue", "max_batch_size": 10, "max_batch_timeout": 5 }
    ]
  }
}
```

Producer type: `Queue`. API: `send()`, `sendBatch()`. Consumer guna `queue` handler.

#### Durable Objects

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "MY_DURABLE_OBJECT", "class_name": "MyDurableObject" }
    ]
  }
}
```

Type: `DurableObjectNamespace`. API: `get()`, `getByName()`, `getById()`.

#### Workers AI

```jsonc
{ "ai": { "binding": "AI" } }
```

Type: `Ai`. API: `env.AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt: "..." })`.

#### Hyperdrive (akses DB luaran)

```jsonc
{
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "<hyperdrive-id>",
      "localConnectionString": "<local-conn-string>"
    }
  ]
}
```

Type: `Hyperdrive`. Property: `env.HYPERDRIVE.connectionString`, `.host`, `.user`, `.password`, `.database`, `.port`.

#### Secrets (wajib vs optional)

```jsonc
{
  "secrets": {
    "required": ["JWT_SECRET"]
  }
}
```

Wrangler akan fail deploy jika secret required tiada. Setiap secret didaftar via:

```powershell
npx wrangler secret put JWT_SECRET
```

### 10.2 Rujukan Lengkap `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-04",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true },
  "vars": { "APP_NAME": "my-app" },
  "secrets": { "required": ["JWT_SECRET"] },
  "d1_databases": [],
  "kv_namespaces": [],
  "r2_buckets": [],
  "queues": {},
  "ai": {},
  "durable_objects": {},
  "hyperdrive": []
}
```

Selepas ubah `wrangler.jsonc` (bindings/vars), sentiasa jalankan:

```powershell
npm run typegen
```

Supaya `worker-configuration.d.ts` menjana type terkini untuk semua bindings.

---

## 11. Authentication Standard

Authentication implementation MUST be explicit and consistent.

Default standard:

- Passwords are stored only as secure password hashes.
- Plain passwords are never logged.
- JWT secrets live in Cloudflare secrets.
- Authentication middleware validates tokens before protected handlers.
- Authorization is separate from authentication.
- Sensitive token information must never be returned unnecessarily.

Recommended access-token payload:

```ts
type AuthTokenPayload = {
  sub: string
  role: string
  iat: number
  exp: number
}
```

Rules:

1. `sub` is the authenticated user ID.
2. Do not place password hashes or sensitive personal data in JWT payloads.
3. Token expiry MUST be configured explicitly.
4. Protected routes MUST use auth middleware.
5. Role checks MUST happen in authorization middleware or service business rules.
6. A user must never be able to access another user's protected data merely by changing an ID parameter.
7. Authentication errors return `401`.
8. Authorization errors return `403`.

Example:

```text
401 = user is not authenticated
403 = user is authenticated but not allowed
```

If refresh tokens are introduced:

- store refresh tokens securely;
- preferably store token hashes rather than plaintext;
- support revocation;
- rotate refresh tokens when appropriate.

---

## 12. Authorization Rules

Authorization must never depend only on frontend controls.

Frontend hiding a button is NOT security.

Every protected action must be enforced on the backend.

Examples:

```text
Admin-only action
Owner-only record access
Manager-or-admin action
User can access own profile only
```

Use explicit policies in services or authorization helpers.

---

## 13. API Response Contract

All API responses MUST follow predictable shapes.

### Single resource

```json
{
  "data": {
    "id": "123"
  }
}
```

### Resource list

```json
{
  "data": []
}
```

### Paginated list

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "lastPage": 5
  }
}
```

### Validation error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Reason."]
  }
}
```

### Not found

```json
{
  "message": "Resource not found."
}
```

### Unauthenticated

```json
{
  "message": "Unauthenticated."
}
```

### Forbidden

```json
{
  "message": "Forbidden."
}
```

### Conflict

```json
{
  "message": "Resource already exists."
}
```

### Unexpected server error

Production:

```json
{
  "message": "Internal server error.",
  "requestId": "..."
}
```

Never return raw stack traces in production.

---

## 14. HTTP Status Codes

Use these conventions:

| Code | Usage |
|------|-------|
| `200` | Successful read/update/action |
| `201` | Resource created |
| `204` | Successful action with no response body |
| `400` | Invalid request outside validation semantics |
| `401` | Unauthenticated |
| `403` | Authenticated but forbidden |
| `404` | Resource not found |
| `409` | Conflict |
| `422` | Validation error |
| `429` | Rate limited |
| `500` | Unexpected server error |

---

## 15. Pagination, Search, Filter and Sort

Use consistent query parameter names.

Default pagination:

```text
?page=1
&perPage=20
```

Search:

```text
?search=yusri
```

Sorting:

```text
?sort=createdAt
&order=desc
```

Filters:

```text
?status=active
?role=admin
```

Rules:

- Default `page`: `1`.
- Default `perPage`: `20`.
- Set a maximum `perPage`, recommended `100`.
- Validate query params with Zod.
- Only allow whitelisted sort columns.
- Never directly interpolate user-provided sort/filter values into raw SQL.

---

## 16. Delete Convention

Default REST behavior:

```text
DELETE /api/resources/:id
```

Successful deletion:

```text
204 No Content
```

Choose deletion strategy per resource:

### Hard delete

Use when permanent deletion is safe and expected.

### Soft delete

Use for important business records when historical/audit recovery matters.

Recommended field:

```text
deleted_at
```

Never implement soft delete inconsistently across repository queries.

---

## 17. Frontend Architecture — React + Vite

React is the standard frontend for this template.

Frontend root:

```text
src/frontend/src/
```

Recommended structure:

```text
src/frontend/src/
├── App.tsx
├── main.tsx
├── index.css
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── logos/
│   ├── fonts/
│   └── illustrations/
│
├── components/
│   ├── common/
│   ├── forms/
│   ├── layout/
│   └── ui/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── users/
│
├── hooks/
├── lib/
├── pages/
├── routes/
├── services/
├── types/
└── utils/
```

### Frontend Asset Convention

There are three different asset locations with different purposes:

```text
src/frontend/src/assets/
public/
dist/
```

#### `src/frontend/src/assets/`

This is the default location for application source assets that are imported by React or TypeScript.

Examples:

```text
src/frontend/src/assets/images/
src/frontend/src/assets/icons/
src/frontend/src/assets/logos/
src/frontend/src/assets/fonts/
src/frontend/src/assets/illustrations/
```

Import assets through Vite:

```tsx
import logo from '@/assets/logos/logo.svg'
import heroImage from '@/assets/images/hero.webp'
```

Use this location for most application images, SVGs, fonts, icons and illustrations.

Benefits:

- Vite fingerprints/hash-names generated files;
- unused assets can be excluded from the bundle;
- imports are validated during build;
- cache-busting is handled automatically.

#### `public/`

Use `src/frontend/public/` only for files that must keep a stable direct URL and should not be processed as normal module imports.

Typical examples:

```text
favicon.ico
robots.txt
manifest.webmanifest
public verification files
```

Do not place normal React application images in `public/` by default.

#### `dist/`

`dist/` is generated build output.

It is NOT a source-code or source-asset directory.

Typical output:

```text
dist/
├── index.html
└── assets/
    ├── index-<hash>.js
    ├── index-<hash>.css
    ├── logo-<hash>.svg
    └── image-<hash>.webp
```

Rules:

1. Never manually edit files inside `dist/`.
2. Never use `dist/` as the source location for React assets.
3. `dist/` must be reproducible by running the build command.
4. `dist/` should normally be ignored by Git unless the deployment method explicitly requires committed build artifacts.
5. Cloudflare should serve the generated build output, not `src/frontend/src/`.
6. Source assets belong in `src/frontend/src/assets/`.
7. Direct static public files belong in `src/frontend/public/`.

Default flow:

```text
src/frontend/src/assets/
        ↓
     Vite build
        ↓
dist/assets/
        ↓
Cloudflare serves production assets
```

### Frontend responsibilities

Frontend handles:

- UI rendering;
- client-side state;
- forms;
- API interaction;
- navigation;
- loading states;
- user-facing validation feedback.

Frontend MUST NOT:

- contain database code;
- contain Cloudflare D1 access;
- contain secrets;
- enforce security by itself;
- duplicate backend business rules unnecessarily.

---

## 18. React Component Rules

Prefer small, reusable components.

Good:

```text
OrderTable
OrderForm
StatusBadge
DashboardCard
ConfirmDialog
```

Avoid giant pages containing all UI and logic in one component.

Recommended rule:

```text
Page
  ↓
Feature components
  ↓
Reusable UI components
```

Page components should primarily coordinate feature components.

---

## 19. Feature-Based Frontend Structure

Business-domain code should live near its feature.

Example:

```text
features/orders/
├── components/
│   ├── OrderForm.tsx
│   └── OrderTable.tsx
├── hooks/
│   └── useOrders.ts
├── services/
│   └── orderApi.ts
└── types.ts
```

Shared generic UI belongs under:

```text
components/ui/
components/common/
```

Do not put business-specific components inside generic UI folders.

---

## 20. Frontend API Layer

Do not scatter raw `fetch()` calls throughout React components.

Use an API service layer.

Example:

```text
services/api.ts
features/users/services/userApi.ts
```

Example responsibility:

```ts
export async function getUser(id: string) {
  return api.get(`/api/users/${id}`)
}
```

React components call feature services or hooks rather than manually rebuilding API logic.

---

## 21. Frontend Error Handling

Every data-driven page SHOULD handle:

```text
idle
loading
success
empty
error
```

Forms SHOULD handle:

- field validation;
- backend `422` errors;
- disabled submission while submitting;
- visible submission errors;
- success state where appropriate.

Never silently swallow API errors.

---

## 22. Frontend Type Safety

Avoid `any`.

Prefer shared API-facing TypeScript types where practical.

Example:

```ts
export type UserResource = {
  id: string
  name: string
  email: string
}
```

Frontend types represent safe API shapes, not database rows.

---

## 23. Frontend Environment Rules

Only expose variables intentionally safe for browser use.

Never expose:

```text
JWT_SECRET
DATABASE_ID secrets
API private keys
private service credentials
```

Frontend-accessible environment values must use the Vite-safe convention where required.

---

## 24. UI Quality Standard

New UI must be:

- responsive;
- accessible;
- visually consistent;
- usable on mobile and desktop;
- free from unnecessary decorative clutter;
- consistent in spacing and typography;
- explicit about loading and error states.

Avoid AI-generated UI patterns that create:

- excessive gradients;
- too many cards;
- meaningless icons;
- huge empty hero sections;
- inconsistent spacing;
- unnecessary animation;
- random colors.

Prefer a professional application UI.

---

## 25. Logging Standard

Every request SHOULD have a request ID.

Log structured data rather than random strings.

Example:

```json
{
  "level": "error",
  "requestId": "abc123",
  "method": "POST",
  "path": "/api/orders",
  "message": "Failed to create order"
}
```

Never log:

```text
passwords
JWT tokens
refresh tokens
API secrets
private keys
full card/payment data
```

Production errors should be diagnosable using `requestId`.

### 25.1 Observability Cloudflare (Workers)

Enable observability dalam `wrangler.jsonc`:

```jsonc
{
  "observability": { "enabled": true }
}
```

Apabila enabled, logs (`console.log()`) + uncaught exceptions + metadata request auto-ingest ke dashboard Workers Logs.

#### Alat Observability

| Tool | Fungsi | Ketersediaan |
|---|---|---|
| Workers Logs (dashboard) | Auto-ingest, filter, analisa logs | Semua plan |
| `npx wrangler tail` | Real-time logs ke terminal | Semua plan |
| Tail Workers | Custom filter/sampling/transform telemetry | Paid & Enterprise |
| Workers Logpush | Export logs ke destination luaran (R2, dll) | Paid |
| Analytics Engine | Custom business metrics, SQL query | Semua plan |

#### Real-time debugging

```powershell
npx wrangler tail
```

Guna untuk investigate exceptions masa nyata.

#### Workers Metrics

View dalam dashboard: **Workers & Pages** → pilih Worker → Metrics.

Chart penting: Requests (total/success/errors), Subrequests, Wall time, CPU time, Execution duration (GB-seconds), Memory usage (128 MB isolate limit).

Invocation statuses (bukan HTTP status):

```text
Success
Client disconnected
Worker threw exception      → error code 1101
Exceeded resources          → 1102, 1027
Internal error
```

#### Logpush (export logs)

Config:

```jsonc
{
  "logpush": true
}
```

Hantar `workers_trace_events` (metadata + console.log + uncaught exceptions) ke destination luaran. Support filters + sampling. Had: logs + exceptions gabungan 16,384 aksara sebelum dipotong.

#### Rules Observability

- Jangan log: passwords, JWT tokens, refresh tokens, API secrets, private keys, full payment data.
- Setiap error production boleh dikesan guna `requestId`.
- Guna structured JSON logs.

---

## 26. Global Error Handling

All uncaught application exceptions must pass through the global exception handler.

Typed exceptions should map to appropriate HTTP status codes.

Examples:

```text
AuthenticationException → 401
AuthorizationException → 403
NotFoundException → 404
DuplicateResourceException → 409
ValidationException → 422
```

Unexpected exceptions:

```text
500 Internal Server Error
```

In production:

- log the internal error;
- return a safe generic message;
- include `requestId`;
- do not return raw stack trace.

---

## 27. Rate Limiting

Rate-limit sensitive endpoints where appropriate.

Typical candidates:

```text
login
register
password reset
OTP
public write endpoints
expensive search endpoints
```

Rate-limit logic may use:

- Durable Objects (per-user/global coordination — pattern standard dalam `src/app/DurableObjects/`);
- KV where suitable (read-heavy counters dengan eventual consistency acceptable);
- repository-backed persistence;
- Cloudflare platform features.

Rate limiting should return:

```text
429 Too Many Requests
```

### 27.1 Durable Object Rate Limiter Pattern

Rate limiter yang perlu coordination kuat (per-user) guna Durable Object:

```text
src/app/DurableObjects/RateLimiter.ts   # DO class (fetch-based, SQLite storage)
src/app/Repositories/RateLimitRepository.ts  # wrapper DO calls
```

Binding DO diaktifkan dalam `wrangler.jsonc`:

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "RATE_LIMITER", "class_name": "RateLimiter" }
    ]
  },
  "exports": {
    "RateLimiter": { "type": "durable-object", "storage": "sqlite" }
  }
}
```

Selepas aktifkan binding:
1. `npm run typegen` — regenerate `worker-configuration.d.ts`.
2. Update repository guna binding sebenar.
3. Tambah integration tests untuk DO behavior.

---

## 28. CORS and Security Headers

CORS MUST be configured intentionally.

Do not use unrestricted production CORS unless the project explicitly requires it.

Security-related headers should be centrally configured.

Examples to evaluate:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Do not blindly copy headers without understanding app requirements.

---

## 29. Testing Strategy

Every persistent feature SHOULD include at least:

1. Service unit tests.
2. Worker/API integration tests.

Repository behavior should be covered where important.

Testing layers:

```text
Unit
  └── Services

Integration
  └── Hono routes + middleware + D1

End-to-end
  └── Optional for critical user flows
```

### 29.1 Testing Cloudflare Resources

- **D1**: jangan mock D1 bila behavior yang diuji bergantung pada SQL, constraints, timestamps, transaksi, atau Drizzle mapping — guna D1 integration test yang sebenar.
- **Durable Objects**: gunakan Miniflare (`@cloudflare/vitest-pool-workers`) untuk mock/test DO behavior termasuk SQLite storage.
- **Workers AI**: local development masih incur usage — rancang test AI pada gating/logic, bukan panggilan model sebenar.
- **Queues**: test producer `send()` dan consumer `queue` handler secara berasingan.

---

## 30. Testing Commands

```powershell
npm run typecheck
npm test
npm run test:workers
```

Before merging/deploying significant work:

```powershell
npm run typecheck
npm test
npm run build
```

All must pass.

---

## 31. Adding a New Backend Resource

Example resource: `Orders`.

### Step 1 — Schema

Update:

```text
src/database/schema/index.ts
```

### Step 2 — Migration

```powershell
npm run db:generate
```

Review the generated SQL.

### Step 3 — Model

Create:

```text
src/app/Models/Order.ts
```

Include safe resource type.

### Step 4 — Repository

Create:

```text
src/app/Repositories/OrderRepository.ts
```

### Step 5 — Service

Create:

```text
src/app/Services/OrderService.ts
```

### Step 6 — Request Schemas

Create:

```text
src/app/Requests/OrderRequest.ts
```

### Step 7 — Controller

Create:

```text
src/app/Controllers/OrderController.ts
```

### Step 8 — Routes

Create:

```text
src/routes/orders.ts
```

Mount inside:

```text
src/routes/api.ts
```

### Step 9 — Service Provider

Register the service/repository composition in:

```text
src/app/Services/AppServiceProvider.ts
```

### Step 10 — Tests

Add:

```text
tests/order-service.test.ts
```

and Worker integration coverage.

### Step 11 — Verify

```powershell
npm run typecheck
npm test
npm run build
```

---

## 32. Adding a New React Feature

Example feature: `orders`.

Create:

```text
src/frontend/src/features/orders/
├── components/
├── hooks/
├── services/
└── types.ts
```

Then:

1. Create API service functions.
2. Create feature-level hooks where useful.
3. Create reusable feature components.
4. Create/update page.
5. Add route.
6. Add loading state.
7. Add empty state.
8. Add error state.
9. Handle validation errors.
10. Verify responsive behavior.

Do not place all logic directly inside the page component.

---

## 33. Service Provider / Dependency Composition

`AppServiceProvider` is the composition root.

Responsibilities:

- instantiate repositories;
- instantiate services;
- inject required environment bindings;
- expose service factory helpers.

Example conceptual flow:

```text
c.env
  ↓
userServiceFrom(c.env)
  ↓
new UserRepository(...)
  ↓
new UserService(...)
```

Controllers should obtain services through these helpers.

This prevents random dependency construction throughout the codebase.

---

## 34. TypeScript Rules

TypeScript strictness should remain enabled.

Rules:

- Avoid `any`.
- Avoid unsafe casts.
- Prefer inferred Drizzle types.
- Prefer explicit public return types for service boundaries.
- Never suppress TypeScript errors just to make builds pass.
- Do not add `@ts-ignore` unless there is a documented technical reason.
- Use `unknown` when data is truly unknown, then validate/narrow it.

---

## 35. Import Rules

Backend alias:

```text
@/* → ./src/*
```

Backend example:

```ts
import { UserService } from '@/app/Services/UserService'
```

Frontend alias should point to:

```text
src/frontend/src
```

Do not create confusing aliases that mean different things within the same build context without explicit Vite/Vitest configuration.

---

## 36. Configuration Rules

Application constants belong in:

```text
src/config/app.ts
```

Examples:

```text
APP_NAME
DEFAULT_PAGE_SIZE
MAX_PAGE_SIZE
TOKEN_EXPIRY
```

Secrets do not belong there.

If a value differs by environment, use environment bindings.

---

## 37. Seed Data Rules

Seed files are intended for local/dev/test bootstrap unless explicitly designed for production.

Location:

```text
src/database/seeders/
```

Never put real customer data or production secrets in seeds.

Seeds should be safe to rerun when practical.

---

## 38. Local Development Commands

```powershell
npm run dev
```

Starts frontend + backend.

Backend only:

```powershell
npm run dev:backend
```

Frontend only:

```powershell
npm run dev:frontend
```

Build:

```powershell
npm run build
```

The frontend build MUST output production-ready files into:

```text
dist/
```

Recommended Vite behavior:

```text
src/frontend/index.html
        ↓
Vite
        ↓
dist/index.html
dist/assets/*
```

`dist/assets/` is generated automatically from imported JavaScript, CSS, images, fonts and other bundled frontend assets.

Preview:

```powershell
npm run preview
```

---

## 39. Local Development Workflow

Recommended workflow:

```text
Create branch
   ↓
Read existing related code
   ↓
Implement schema/model/repository/service/controller/routes
   ↓
Implement React feature
   ↓
Run local migration
   ↓
Run typecheck
   ↓
Run tests
   ↓
Run build
   ↓
Manual browser verification
   ↓
Commit
```

---

## 40. Git Rules

Recommended branch names:

```text
feature/orders
fix/login-validation
refactor/user-service
```

Commit meaningful units of work.

Do not commit:

```text
.env
node_modules
dist
.local D1 state
temporary debug files
secrets
build artifacts unless intentionally required
```

Default `.gitignore` should include:

```gitignore
node_modules/
dist/
.env
.dev.vars
.wrangler/
```

If a deployment platform builds from Git, commit the source and let the deployment build `dist/`.

Only commit `dist/` when a specific deployment workflow explicitly requires generated artifacts to live in Git.

---

## 41. Deployment Workflow

Default deployment path (manual — sebelum sambung GitHub):

```text
Local development
   ↓
Typecheck
   ↓
Tests
   ↓
Build
   ↓
npm run db:migrate:remote   # apply migration ke production
   ↓
npx wrangler deploy         # deploy manual ke Cloudflare
   ↓
Production verification
```

Nota penting:
- GitHub/CI belum aktif untuk projek ini. Semua deploy manual (`wrangler deploy`).
- Selepas aplikasi stabil & terbukti berfungsi, baru sambung GitHub secara manual untuk auto deploy (lihat 41.1).
- Jangan sambung GitHub sebelum aplikasi betul-betul tested.

For the React frontend, production deployment should build the source first:

```text
src/frontend/
   ↓
npm run build
   ↓
dist/
   ↓
Cloudflare static asset serving
```

Cloudflare deployment configuration should reference the generated `dist/` output where static assets are expected.

For schema changes:

```text
Schema change
   ↓
Generate migration
   ↓
Review migration
   ↓
Apply locally
   ↓
Test
   ↓
Commit migration
   ↓
Apply remote migration using controlled deployment process
   ↓
Deploy compatible application code
   ↓
Verify production
```

For risky schema changes, prefer backward-compatible staged deployment.

Example:

```text
1. Add nullable/new column
2. Deploy code supporting old + new schema
3. Backfill data if necessary
4. Switch application usage
5. Remove old column in a later migration
```

Avoid destructive schema changes and application deployment occurring blindly in one step.

### 41.1 Workers Builds (Git Integration) — Auto Deploy

Cloudflare boleh connect Worker ke GitHub/GitLab repo untuk auto build + deploy pada setiap push.

Konsep penting:

| Konsep | Maksud |
|---|---|
| **Version** | Build Worker yang di-upload. Belum aktif ke production. |
| **Active Deployment** | Version yang sedang melayan trafik production. |
| `wrangler deploy` | Upload version + promote ke Active Deployment. |
| `wrangler versions upload` | Upload version sahaja (tanpa promote). |

Cara sambung (dashboard):
1. **Workers & Pages** → **Create application** → **Import a repository**.
2. Pilih Git account → pilih repo → **Save and Deploy**.
3. Untuk Worker sedia ada: **Settings** → **Builds** → **Connect**.

Aturan penting (caution):
- Nama Worker di dashboard MESTI sama dengan `name` dalam `wrangler.jsonc` di root repo, atau build fail.
- Production branch default deploy command = `npx wrangler deploy`.
- Non-production branch (jika diaktifkan) = `npx wrangler versions upload` (code sahaja, tiada rollout).
- Untuk disable auto-deploy tapi kekal build: deploy command = `npx wrangler versions upload`.

Untuk Container Workers:
- Production branch guna `wrangler deploy` (publish image + rollout).
- Preview URLs tidak dijana untuk Workers dengan Durable Objects (termasuk Containers).

### 41.2 Versions and Deployments Workflow

Workflow selamat untuk production:

```text
1. Deploy version baru (wrangler versions upload)
2. Test version melalui preview URL
3. Promote ke Active Deployment (dashboard atau wrangler deploy)
```

---

## 42. Production Deployment Safety

Before production deployment:

```powershell
npm run typecheck
npm test
npm run build
```

Verify:

- correct Cloudflare account;
- correct Worker name;
- correct D1 binding;
- correct D1 database ID;
- required secrets exist;
- migration has been reviewed;
- production environment vars are correct.

After deployment verify:

```text
health endpoint
authentication
critical API flow
critical UI page
database write
database read
```

Untuk Containers, sahkan juga:

```text
npx wrangler containers list
npx wrangler containers images list
```

---

## 43. Health Endpoint

Every project SHOULD provide a basic health endpoint.

Example:

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Optionally include safe version/environment metadata.

Do not expose secrets or detailed infrastructure internals.

---

## 44. API Versioning

Do not introduce versioning unless required.

Default:

```text
/api/...
```

If breaking public API compatibility becomes important:

```text
/api/v1/...
```

Avoid premature version complexity for internal applications.

---

## 45. Performance Rules

Avoid premature optimization, but follow sane defaults.

Rules:

- paginate large lists;
- avoid N+1 patterns;
- select only necessary columns where useful;
- index columns used frequently for lookups/filtering;
- avoid expensive processing inside request handlers;
- cache only where correctness allows;
- keep Workers execution lightweight.

Measure before introducing complicated caching architecture.

---

## 46. D1 Query Rules

Repository queries should:

- use parameterized Drizzle queries;
- avoid raw SQL unless justified;
- avoid unbounded list queries;
- use indexes for common lookups;
- keep transactions/atomic behavior explicit where needed.

Do not let controllers construct database conditions.

---

## 47. Background Work

Long or non-critical work SHOULD not block HTTP requests when Cloudflare-native asynchronous tools are appropriate.

Possible options:

```text
Queues
Workflows
Cron Triggers
Durable Objects
```

Do not add them automatically.

Use them only when the feature genuinely requires asynchronous or stateful behavior.

### 47.1 Pilih Tool Background yang Betul

| Tool | Guna bila | API utama |
|---|---|---|
| **Queues** | Kerja background ringan, message-based, perlu guaranteed delivery | `env.QUEUE.send()`, handler `queue()` |
| **Workflows** | Multi-step durable, retry automatik, boleh tahan minit/jam/minggu | `step.do()`, `step.sleep()`, `step.waitForEvent()` |
| **Cron Triggers** | Jadual berkala tetap (contoh: cleanup, report harian) | `scheduled()` handler |
| **Durable Objects** | Perlu state per-instance + coordination masa nyata | RPC methods, `ctx.storage.sql` |

### 47.2 Workflows (Durable Multi-Step)

Workflows = chain beberapa steps, auto-retry, persist state lama. Untuk:
- data pipelines
- user lifecycle (email automatik, trial expiry)
- human-in-the-loop approval
- AI applications yang memerlukan multi-step

```ts
export class ImageProcessingWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent, step: WorkflowStep) {
    const imageData = await step.do('fetch image', async () => {
      const object = await this.env.BUCKET.get(event.payload.imageKey);
      return await object.arrayBuffer();
    });

    await step.waitForEvent('await approval', {
      event: 'approved',
      timeout: '24 hours',
    });

    await step.do('publish', async () => {
      await this.env.BUCKET.put(`public/${event.payload.imageKey}`, imageData);
    });
  }
}
```

Kelebihan:
- Durable execution tanpa timeouts.
- Pause untuk external events / approval (`step.waitForEvent`).
- Automatic retries + error handling.
- Sleep / scheduling: `step.sleep()`, `step.sleepUntil()`.

### 47.3 Cron Triggers

Tambahkan `scheduled()` handler:

```ts
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCleanup(env));
  },
};
```

Config dalam `wrangler.jsonc`:

```jsonc
{
  "triggers": {
    "crons": ["0 0 * * *"]
  }
}
```

---

## 48. Durable Objects

Use Durable Objects only when coordination/state semantics justify them.

Good examples:

```text
WebSocket rooms
real-time games
distributed locking
per-key coordination
strongly coordinated rate limiting
stateful sessions
```

Do not use Durable Objects for ordinary CRUD.

### 48.1 Struktur Fail

```text
src/app/DurableObjects/
  |-- RateLimiter.ts           # DO class (implements fetch / RPC methods)
  |-- __init__.ts              # module marker

src/app/Repositories/
  |-- RateLimitRepository.ts   # wrapper mengelilingi DO calls
```

- DO class dalam `src/app/DurableObjects/` — bukan dalam routes/services/controllers.
- Setiap DO ada **globally-unique name** + **durable storage** (strongly consistent).
- DO tidak terima request Internet terus — mesti melalui Worker.
- Public method pada DO class terdedah sebagai **RPC methods** — boleh dipanggil Worker lain.

### 48.2 SQLite Storage dalam DO (Standard Baharu)

Setiap DO boleh ada **private SQLite database** — akses hanya oleh DO itu sendiri. Storage API (`ctx.storage.sql`) telah **GA** (bukan beta).

- SQLite-backed DO tersedia di **Workers Free plan** (dengan had — rujuk pricing/limits).
- Transactional, strongly consistent, serializable storage.
- Setiap DO instance = satu SQLite DB sendiri — tiada contention antara instances.
- Class DO baru WAJIB guna config `exports` untuk SQLite storage.

Config `wrangler.jsonc`:

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "MY_DURABLE_OBJECT", "class_name": "MyDurableObject" }
    ]
  },
  "exports": {
    "MyDurableObject": {
      "type": "durable-object",
      "storage": "sqlite"
    }
  }
}
```

Contoh DO dengan SQL API:

```ts
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async sayHello(): Promise<string> {
    const result = this.ctx.storage.sql
      .exec("SELECT 'Hello, World!' as greeting")
      .one();
    return result.greeting;
  }
}
```

Access dari Worker:

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);
    const greeting = await stub.sayHello();
    return new Response(greeting);
  },
} satisfies ExportedHandler<Env>;
```

Nota:
- Legacy `migrations` array (`new_sqlite_classes`) = cara lama declare DO class.
- `migrations` masih relevan untuk projek sedia ada yang perlu mengurus lifecycle class (rename, delete, transfer).

### 48.3 Pilih Storage DO

| Storage | Guna bila |
|---|---|
| `"sqlite"` | Perlu query relational dalam DO: join, aggregations, consistency kuat |
| `"kv"` (legacy) | Simpan value ringkas sahaja, tak perlu SQL query |

---

## 49. R2

Use R2 for object/file storage.

Examples:

```text
images
documents
exports
receipts
uploads
```

Do not store large binary files inside D1.

Store metadata in D1 and object data in R2 where appropriate.

### 49.1 Detail R2

R2 = object storage zero-egress (tiada caj egress bandwidth).

Cara akses (pilih ikut keperluan):

| Method | Guna bila |
|---|---|
| Workers API | App Worker baca/tulis R2 |
| S3 | Guna SDK S3-compatible dalam app sedia ada |
| CLI | Upload/download/manage dari terminal |
| Dashboard | Manage buckets secara visual |

Config:

```jsonc
{
  "r2_buckets": [
    { "binding": "BUCKET", "bucket_name": "my-bucket" }
  ]
}
```

Workers API:

```ts
// Read
const object = await env.BUCKET.get(key);
if (object === null) { /* not found */ }
const data = await object.arrayBuffer();

// Write
await env.BUCKET.put(key, data, { httpMetadata: { contentType: "image/png" } });

// Delete
await env.BUCKET.delete(key);
```

Features berguna:
- **Location Hints** — petunjuk geografi semasa cipta bucket (akses utama).
- **CORS** — konfigurasi akses dari browser.
- **Public buckets** — dedah bucket terus ke Internet.
- **Bucket scoped tokens** — kawalan akses granular.
- **Event Notifications** — trigger Queues bila objek berubah.

---

## 50. KV

Use KV for read-heavy, eventually consistent data.

Examples:

```text
cache
feature configuration
public lookup data
temporary read-mostly values
```

Do not use KV when strong transactional consistency is required.

### 50.1 Detail KV

KV = key-value global low-latency, edge-cached reads.

Cipta namespace:

```powershell
npx wrangler kv namespace create BINDING_NAME
```

Config:

```jsonc
{
  "kv_namespaces": [
    { "binding": "BINDING_NAME", "id": "<namespace-id>" }
  ]
}
```

Operasi:

```ts
await env.KV.put("key", "value");
const value = await env.KV.get("key");
const allKeys = await env.KV.list();
await env.KV.delete("key");
```

Wrangler CLI:

```powershell
npx wrangler kv key put --binding=BINDING_NAME "key" "value"
npx wrangler kv key get --binding=BINDING_NAME "key" --text
```

Nota development:
- `wrangler dev` guna **local KV** secara default (production data tidak terganggu).
- Untuk connect ke remote: set `"remote": true` dalam binding config.
- Baca key yang belum ditulis lokal = `null`.

---

## 51. Queues

Use Queues for asynchronous work such as:

```text
email sending
webhook delivery
report processing
background notifications
slow integrations
```

HTTP requests should return without waiting for non-critical background work when appropriate.

### 51.1 Detail Queues

Queues = messaging guaranteed delivery, tiada caj egress.

Cipta queue:

```powershell
npx wrangler queues create MY-QUEUE-NAME
```

Nama: 1-63 aksara, hanya huruf/nombor/dash, mula & tamat dengan huruf/nombor. Nama tidak boleh ditukar selepas cipta.

Config producer:

```jsonc
{
  "queues": {
    "producers": [
      { "queue": "MY-QUEUE-NAME", "binding": "MY_QUEUE" }
    ]
  }
}
```

Producer (send):

```ts
await env.MY_QUEUE.send({ url: request.url, method: request.method });
await env.MY_QUEUE.sendBatch([msg1, msg2]);
```

Consumer (terima) — tambah `queue` handler dalam Worker:

```ts
export default {
  async fetch(request, env, ctx): Promise<Response> {
    await env.MY_QUEUE.send({ data: "x" });
    return new Response("Success!");
  },
  async queue(batch, env, ctx): Promise<void> {
    for (const message of batch.messages) {
      console.log("consumed:", JSON.stringify(message.body));
    }
  },
} satisfies ExportedHandler<Env>;
```

Config consumer:

```jsonc
{
  "queues": {
    "consumers": [
      { "queue": "MY-QUEUE-NAME", "max_batch_size": 10, "max_batch_timeout": 5 }
    ]
  }
}
```

- `max_batch_size` (default 10) — call consumer bila batch penuh.
- `max_batch_timeout` (default 5s) — call consumer walaupun tak sampai batch size.
- Satu queue = satu consumer Worker sahaja.
- Message expire default 4 hari.
- **Dead Letter Queues** — redirect messages bila delivery gagal.
- **Pull consumers** — consume dari HTTP di luar Workers.

---

## 52. Cloudflare AI & Advanced Compute (Detail)

Produk tambahan Cloudflare yang boleh diintegrasikan dengan architecture ini bila keperluan wujud. Jangan tambah automatik — tambah hanya bila feature benar-benar memerlukannya.

### 52.1 Workers AI — Serverless Inference

Run LLM dan ML models pada serverless GPUs. Tersedia Free & Paid plans.

- 50+ open-source models: text generation, image classification, object detection.
- Pay-for-what-you-use.
- Boleh dipanggil dari Workers, Pages, atau API Cloudflare.

Config:

```jsonc
{ "ai": { "binding": "AI" } }
```

Senarai model:

```powershell
npx wrangler ai models
```

Contoh (LLM):

```ts
export interface Env { AI: Ai; }

export default {
  async fetch(request, env): Promise<Response> {
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      prompt: "What is the origin of the phrase Hello, World",
    });
    return new Response(JSON.stringify(response));
  },
} satisfies ExportedHandler<Env>;
```

Nota: Workers AI local development masih incur usage charges (run models guna akaun Cloudflare).

### 52.2 AI Gateway

Proksi/gerbang untuk kawal AI applications:
- caching
- rate limiting
- request retries
- model fallback
- observability

Sesuai bila app guna banyak AI calls dan perlu kawal kos + kebolehpercayaan.

### 52.3 Vectorize — Vector Database

Vector database global untuk AI semantic search.

Guna bila:
- semantic search
- recommendations
- anomaly detection
- RAG (context + memory untuk LLM)

Integrasi dengan Workers AI (embeddings) + R2/KV/D1 (source data). Vectors boleh rujuk images di R2, dokumen di KV, profil di D1.

### 52.4 Agents SDK — AI Agents

Build stateful AI agents: durable identity, SQL storage, real-time WebSockets, scheduled tasks, recoverable execution. Scale hingga puluhan juta instances.

Starter:

```powershell
npx create-cloudflare@latest --template cloudflare/agents-starter
cd agents-starter && npm install
npm run dev
```

Komponen:
1. **Communication channels** — chat, voice, email, Slack, webhooks.
2. **Agent harness** — model call, tool selection, response flow.
3. **Agents SDK runtime** — Agent class, state, sessions, routing, WebSockets, scheduling.
4. **Tools** — Browser automation, Sandbox code execution, AI Search, MCP, Payments.

### 52.5 Browser Run — Headless Browser

Headless Chrome di global network untuk automation, scraping, testing, content generation.

- **Quick Actions**: stateless tasks (screenshot, PDF, scrape, Markdown, JSON, crawl) — no code deployment.
- **Browser Sessions**: full control via Puppeteer, Playwright, CDP, Stagehand.

Guna bila:
- screenshot / PDF generation
- web scraping
- web testing / automation
- AI-powered data extraction

### 52.6 Hyperdrive — Akselerasi DB Luaran

Ubah regional database (Postgres/MySQL) menjadi globally distributed.

- Sokong Postgres + MySQL (AWS, GCP, Azure, Neon, PlanetScale, CockroachDB, Timescale).
- Tanpa menulis kod baru — guna driver/ORM sedia ada.
- Query caching default-on.

Config:

```jsonc
{
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "<hyperdrive-id>",
      "localConnectionString": "<local-conn-string>"
    }
  ]
}
```

Contoh (Postgres):

```ts
import { Client } from "pg";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
    await client.connect();
    const result = await client.query("SELECT * FROM pg_tables");
    return Response.json(result.rows);
  },
} satisfies ExportedHandler<{ HYPERDRIVE: Hyperdrive }>;
```

**Suggestion penggunaan**: guna D1 untuk data aplikasi baharu. Guna Hyperdrive hanya bila dah ada database luaran sedia ada yang perlu diakses dari Workers.

### 52.7 Containers — Serverless Containers (Paid plan)

Run kod apa-apa bahasa/runtime sebagai container image. Available on Workers Paid plan.

Guna bila:
- workload resource-intensive (CPU parallel, memory besar)
- perlu full filesystem / runtime spesifik / Linux environment
- apps sedia ada yang diedarkan sebagai container image

```jsonc
{
  "containers": [
    {
      "class_name": "MyContainer",
      "image": "./Dockerfile",
      "max_instances": 5
    }
  ],
  "durable_objects": {
    "bindings": [
      { "class_name": "MyContainer", "name": "MY_CONTAINER" }
    ]
  }
}
```

Nota:
- `wrangler deploy` publish image + rollout.
- `wrangler versions upload` = upload code sahaja (non-production).
- Docker diperlukan hanya bila `image` = Dockerfile path.
- Preview URLs TIDAK dijana untuk Workers dengan Durable Objects.

### 52.8 Pilih Produk Cloudflare — Jadual Suggestion

| Keperluan | Produk |
|---|---|
| Relational data app | D1 |
| DB luaran sedia ada | Hyperdrive |
| Cache/read-heavy values | KV |
| File/objek besar | R2 |
| State bersama + real-time | Durable Objects (SQLite) |
| Kerja background | Queues |
| Multi-step durable | Workflows |
| Jadual berkala | Cron Triggers |
| AI inference | Workers AI |
| Semantic search | Vectorize |
| AI agent stateful | Agents SDK |
| Headless browser | Browser Run |
| Video streaming | Stream |
| Imej optimize | Images |
| Live video/voice | Realtime |

---

## 53. API Idempotency

For operations vulnerable to duplicate submissions, consider idempotency.

Examples:

```text
payments
checkout
external webhook processing
bulk imports
order submission
```

Do not add complexity to ordinary CRUD unless needed.

---

## 54. Auditability

Important business actions SHOULD capture audit-relevant metadata where necessary.

Potential fields:

```text
created_at
updated_at
created_by
updated_by
deleted_at
```

Sensitive business systems may require dedicated audit logs.

Do not add audit logging to every table blindly.

---

## 55. Date and Time Rules

Store timestamps in a consistent machine-safe format.

Prefer UTC for backend persistence.

Frontend converts to user-local display time.

Do not mix local timezone assumptions inside database logic.

---

## 56. IDs

Choose one ID strategy per project/resource and keep it consistent.

Possible options:

```text
UUID
ULID
integer autoincrement
```

Do not expose predictable sequential IDs when the domain has a security/privacy reason not to.

Authorization must never rely on IDs being hard to guess.

---

## 57. Validation vs Business Rules

Validation answers:

```text
"Is the input structurally valid?"
```

Service business rules answer:

```text
"Is this operation allowed?"
```

Example:

```text
Zod:
quantity must be a positive integer.

Service:
quantity cannot exceed available stock.
```

Do not push database-backed business rules into Zod schemas.

---

## 58. Repository vs Service Rule

Repository:

```text
How is data stored/retrieved?
```

Service:

```text
What should the application do?
```

Example:

```text
UserRepository.findByEmail(email)

AuthService.login(email, password)
```

Do not turn repositories into business-rule classes.

---

## 59. Controller Size Rule

If a controller action becomes complex, move logic into the service.

A controller should usually read like:

```text
validate
resolve service
call method
return response
```

Not:

```text
validate
query database
branch business rules
calculate totals
send notification
format multiple resources
update another table
return response
```

---

## 60. React State Rules

Prefer local component state for local UI state.

Use feature hooks for reusable async/data logic.

Do not introduce a global state library unless the project genuinely requires it.

Do not add Redux/Zustand/etc. by default.

---

## 61. React Routing

Keep page routing in:

```text
src/frontend/src/routes/
```

Page components belong in:

```text
src/frontend/src/pages/
```

Feature components should not own global route configuration.

---

## 62. Forms

Forms SHOULD:

- validate obvious client-side requirements;
- still rely on backend validation as source of truth;
- map backend `422` errors to fields;
- prevent duplicate submission;
- show submission state.

Frontend validation never replaces backend validation.

---

## 63. Accessibility

UI components SHOULD:

- use semantic HTML;
- have labels for form controls;
- support keyboard navigation;
- preserve visible focus states;
- provide meaningful button labels;
- avoid color-only status indicators.

---

## 64. Dependency Policy

Before adding a dependency, check whether the project can solve the requirement cleanly without it.

AI agents MUST NOT add dependencies merely for convenience.

Before installing a dependency, verify:

1. It solves a real requirement.
2. Existing dependencies do not already solve it.
3. It is compatible with Cloudflare Workers where backend-facing.
4. It does not substantially increase complexity without benefit.

---

## 65. No Architecture Bypass Rule

These are prohibited:

```text
Route → Drizzle
Route → D1
Controller → Drizzle
Controller → D1
React → D1
React → Cloudflare binding
```

Persistent backend code MUST use:

```text
Route
→ Request
→ Controller
→ Service
→ Repository
→ Drizzle
→ D1
```

---

## 66. AI Agent Operating Rules

Every AI coding agent working on this project MUST follow these rules.

### Before editing code

1. Read `AGENTS.md` and architecture SOPs.
2. Inspect the relevant existing files.
3. Identify the existing architecture/pattern.
4. Reuse existing helpers and conventions.
5. Check related tests.
6. Understand the requested scope before modifying files.

### While implementing

1. Follow existing architecture exactly.
2. Do not bypass service/repository layers.
3. Do not introduce a new framework.
4. Do not add dependencies unless required.
5. Do not change unrelated files.
6. Do not rename unrelated code.
7. Do not perform broad refactors unless explicitly requested.
8. Keep controllers thin.
9. Keep React pages composed from smaller components.
10. Preserve public API contracts unless the task requires change.
11. Preserve backward compatibility where reasonable.
12. Add/update tests for changed behavior.

### Before finishing

Run:

```powershell
npm run typecheck
npm test
npm run build
```

Then report:

```text
Files changed
What changed
Tests added/updated
Commands run
Known limitations
```

---

## 67. AI Agent Prohibited Behaviors

AI agents MUST NOT:

- invent project requirements;
- silently redesign architecture;
- add dependencies without reason;
- disable failing tests;
- delete tests just to make CI pass;
- use `any` to bypass TypeScript;
- use `@ts-ignore` without documented reason;
- expose secrets;
- hardcode production credentials;
- query D1 from controllers;
- put backend logic inside React;
- manually edit already-deployed migrations;
- create unnecessary abstractions;
- refactor unrelated code;
- change API response contracts without requirement;
- replace working code merely because another style is preferred.

---

## 68. AI Agent Feature Checklist

For every new persistent backend feature, confirm:

```text
[ ] Schema updated
[ ] Migration generated
[ ] Migration reviewed
[ ] Model/resource type created
[ ] Repository created/updated
[ ] Service created/updated
[ ] Request validation created
[ ] Controller created/updated
[ ] Route created/updated
[ ] ServiceProvider updated
[ ] Authorization checked
[ ] Unit tests added
[ ] Integration tests added
[ ] Typecheck passes
[ ] Tests pass
[ ] Build passes
```

For React UI:

```text
[ ] Page/feature location follows structure
[ ] API calls use service layer
[ ] Loading state exists
[ ] Empty state exists where relevant
[ ] Error state exists
[ ] Form validation handled
[ ] Backend 422 handled
[ ] Responsive layout checked
[ ] Accessibility basics checked
[ ] No secret exposed to frontend
[ ] App assets stored in `src/frontend/src/assets/`
[ ] `public/` used only for direct/static URL files
[ ] `dist/` not edited manually
[ ] Production build generates `dist/` successfully
```

---

## 69. Pull Request / Review Checklist

Before merging:

```text
[ ] Scope matches requirement
[ ] No unrelated code changed
[ ] Architecture respected
[ ] No direct D1 access outside repositories
[ ] Input validated
[ ] Authorization enforced server-side
[ ] Safe resource returned
[ ] Error responses follow contract
[ ] Migration reviewed
[ ] Tests added or updated
[ ] Typecheck passes
[ ] Tests pass
[ ] Build passes
[ ] No secrets committed
```

---

## 70. Production Readiness Checklist

Before first production release:

```text
[ ] Worker name correct
[ ] D1 database binding correct
[ ] Remote database ID correct
[ ] Required secrets configured
[ ] Environment variables correct
[ ] Production migrations applied
[ ] Health endpoint works
[ ] Authentication works
[ ] Authorization tested
[ ] Rate limiting applied where required
[ ] CORS configured intentionally
[ ] Error handling hides stack traces
[ ] Logging contains request IDs
[ ] Critical frontend pages tested
[ ] Mobile layout checked
[ ] Typecheck passes
[ ] Tests pass
[ ] Build passes
[ ] Git working tree clean
```

---

## 71. Recommended `package.json` Scripts

The exact commands may vary by project, but projects SHOULD expose predictable commands similar to:

```json
{
  "scripts": {
    "dev": "...",
    "dev:backend": "...",
    "dev:frontend": "...",
    "build": "...",
    "preview": "...",
    "typecheck": "...",
    "test": "...",
    "test:workers": "...",
    "typegen": "...",
    "db:generate": "...",
    "db:migrate": "...",
    "db:migrate:remote": "...",
    "db:seed": "...",
    "db:seed:remote": "..."
  }
}
```

Agents should use project scripts instead of inventing equivalent ad hoc commands.

---

## 72. Definition of Done

A feature is NOT done simply because the code compiles.

A feature is done when:

1. Requirement is implemented.
2. Architecture rules are respected.
3. Input is validated.
4. Business rules are enforced.
5. Authorization is correct.
6. API response contract is correct.
7. React states are handled.
8. Tests cover important behavior.
9. Typecheck passes.
10. Tests pass.
11. Build passes.
12. No secrets are exposed.
13. No unrelated regressions were introduced.
14. Production deployment implications are understood.

---

## 73. Final Architecture Summary

Backend:

```text
Hono Route
   ↓
Zod Request
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Drizzle
   ↓
Cloudflare D1
```

Frontend:

```text
React source + src/assets
   ↓
Vite build
   ↓
dist/
   ↓
Cloudflare static assets

React Page
   ↓
Feature Component / Hook
   ↓
Frontend API Service
   ↓
Hono API
```

Infrastructure:

```text
Cloudflare Workers
├── D1                  # relational data (default)
├── Durable Objects     # stateful coordination + SQLite storage (only when required)
├── KV                  # read-heavy cache (only when required)
├── R2                  # files/objects
├── Queues              # async work
├── Workflows           # durable multi-step (only when required)
├── Cron Triggers       # scheduled jobs (only when required)
├── Workers AI          # AI inference (only when required)
├── Vectorize           # semantic search (only when required)
├── Hyperdrive          # external DB acceleration (only when required)
└── Workers Builds      # CI/CD Git integration
```

Development:

```text
Read existing code
   ↓
Implement
   ↓
Typecheck
   ↓
Tests
   ↓
Build
   ↓
npx wrangler deploy (manual)
   ↓
Production verification
   ↓
[Selepas stabil] sambung GitHub untuk auto deploy
```

This architecture is the default. Deviations require a clear technical reason.

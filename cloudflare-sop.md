# Cloudflare Deploy SOP (Complete)

> SOP rasmi deploy aplikasi ke Cloudflare Developer Platform.
> Sumber: https://developers.cloudflare.com/ — semua produk kategori Build.
> Agent: baca MD ni untuk tahu cara deploy semua produk Cloudflare.

---

## 1. Pra-Syarat (Semua Produk)

1. Cipta akaun Cloudflare: https://dash.cloudflare.com/sign-up/workers-and-pages
2. Install Node.js `16.17.0` atau lebih baru. Guna version manager (Volta / nvm) untuk elak permission issues.
3. Tool utama = **Wrangler CLI** (dipasang automatik oleh `create-cloudflare`):
   ```powershell
   npm create cloudflare@latest my-app
   ```
4. Login Wrangler (browser OAuth):
   ```powershell
   npx wrangler login
   npx wrangler whoami
   ```
5. Node version manager disyorkan untuk urus versi Node.

### Struktur Fail Projek (dibuat oleh C3)

- `wrangler.jsonc` — fail konfigurasi Wrangler (semua binding & setting di sini)
- `src/index.ts` (atau `.js`) — kod Worker
- `package.json`, `package-lock.json`, `node_modules`
- `worker-configuration.d.ts` — type definitions untuk bindings

### C3 Non-Interaktif (untuk CI)

```powershell
CI=true npm create cloudflare@latest d1-tutorial --type=simple --git --ts --deploy=false
```

### C3 dari Git Repo Sedia Ada

```powershell
npm create cloudflare@latest -- --template <SOURCE>
```

`<SOURCE>` boleh: `user/repo`, URL GitHub, `user/repo#branch`, commit hash, Bitbucket, GitLab.
Syarat minimum repo: `package.json` + `wrangler.jsonc` + `src/` dengan worker script.

---

## 2. Workflow Asas (Semua Worker)

### 2.1 Kembangkan secara lokal

```powershell
npx wrangler dev
```

- Buka http://localhost:8787
- Fail utama: `src/index.js`

```js
export default {
	async fetch(request, env, ctx) {
		return new Response("Hello World!");
	},
};
```

- `fetch` handler dipanggil bila Worker terima HTTP request.
- Parameter: `request`, `env` (bindings), `ctx` (context/waitUntil).
- Tambah `scheduled()` handler untuk Cron Triggers.

### 2.2 Deploy ke production

```powershell
npx wrangler deploy
```

- Deploy ke `*.workers.dev` subdomain atau Custom Domain.
- URL preview: `<YOUR_WORKER>.<YOUR_SUBDOMAIN>.workers.dev`
- Jika `523 errors` kali pertama, tunggu seminit, ia settle sendiri.

### 2.3 Testing & Observability

- Test lokal: `npx wrangler dev`
- Logs masa nyata: `npx wrangler tail`
- Metrics & analytics: dashboard Workers

**Enable observability dalam `wrangler.jsonc`:**

```jsonc
{
	"observability": { "enabled": true }
}
```

Selepas ini, Workers logs auto-ingest ke dashboard (Workers Logs).

---

## 3. CI/CD — Workers Builds (Git Integration)

Connect Worker ke GitHub/GitLab untuk auto build + deploy pada setiap push.

### Connect Worker Baru

1. Dashboard → **Workers & Pages** → **Create application** → **Import a repository**
2. Pilih Git account → pilih repo → **Save and Deploy**

### Connect Worker Sedia Ada

1. Dashboard → pilih Worker → **Settings** → **Builds** → **Connect**
2. Push commit ke Git untuk trigger build + deploy.

### Penting (Caution)

- Nama Worker di dashboard **mesti sama** dengan `name` dalam `wrangler.jsonc` di root dir repo, atau build fail.

### Autoconfig

Repo tanpa `wrangler.jsonc`: autoconfig detect framework, create PR untuk configure, generate preview deployment. Selepas merge PR, project sedia deploy.

### Versions & Deployments

- Build berjaya → upload sebagai **version**.
- Jika deploy command `wrangler deploy` → version dipromosikan ke **Active Deployment**.
- Untuk disable auto-deploy tapi kekal build (jadi version sahaja): deploy command = `npx wrangler versions upload`.

### Production vs Non-Production Branch

| Branch | Default deploy command | Kesan |
|---|---|---|
| Production | `npx wrangler deploy` | Upload + activate + (untuk Containers) publish image & rollout |
| Lain (jika diaktifkan) | `npx wrangler versions upload` | Upload code sahaja, tiada rollout |

---

## 4. Bindings — Sambung Resource (Konsep Teras)

**Binding** = cara Worker access resource Cloudflare (D1, KV, R2, AI, dll) melalui `env.<BINDING_NAME>`.

- Nama binding mesti valid JavaScript variable name (contoh: `MY_DB`, `productionDB`).
- Access dalam Worker: `env.<BINDING_NAME>`.
- Bindings diisytihar dalam `wrangler.jsonc`.
- Boleh tambah manual atau automatik melalui dashboard (tab **Bindings**).

---

## 5. Storage & Databases

### 5.1 D1 — Serverless SQL (SQLite)

SQL database serverless dibina untuk query global pantas.

**Cipta database:**

```powershell
npx wrangler d1 create prod-d1-tutorial
```

Output memberi `binding`, `database_name`, `database_id`. Pilih `Yes` bila ditanya untuk auto-add ke wrangler file.

**Config `wrangler.jsonc`:**

```jsonc
{
	"d1_databases": [
		{
			"binding": "prod_d1_tutorial",
			"database_name": "prod-d1-tutorial",
			"database_id": "<unique-ID-for-your-database>"
		}
	]
}
```

**Inisialisasi schema lokal:**

```powershell
npx wrangler d1 execute prod-d1-tutorial --local --file=./schema.sql
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM Customers"
```

**Query dalam Worker (guna prepared statement = anti SQL injection):**

```ts
export interface Env {
	prod_d1_tutorial: D1Database;
}

export default {
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (pathname === "/api/beverages") {
			const { results } = await env.prod_d1_tutorial
				.prepare("SELECT * FROM Customers WHERE CompanyName = ?")
				.bind("Bs Beverages")
				.run();
			return Response.json(results);
		}
		return new Response("Call /api/beverages");
	},
} satisfies ExportedHandler<Env>;
```

**Deploy ke remote (production):**

```powershell
npx wrangler d1 execute prod-d1-tutorial --remote --file=./schema.sql
npx wrangler d1 execute prod-d1-tutorial --remote --command="SELECT * FROM Customers"
npx wrangler deploy
```

**Delete:**

```powershell
npx wrangler d1 delete prod-d1-tutorial
npx wrangler delete d1-tutorial
```

Nota:
- `--local` = database lokal development. `--remote` = production.
- Nama DB elok: `<32 char`, guna dashes, deskriptif (cth `production-db-backend`).

### 5.2 KV — Key-Value Global

Storan key-value low-latency, edge-cached reads. Sesuai: cache API response, user preferences, auth tokens. Read-heavy workloads.

**Cipta namespace:**

```powershell
npx wrangler kv namespace create USERS_NOTIFICATION_CONFIG
```

**Config `wrangler.jsonc`:**

```jsonc
{
	"kv_namespaces": [
		{
			"binding": "USERS_NOTIFICATION_CONFIG",
			"id": "<BINDING_ID>"
		}
	]
}
```

**Operasi KV (Wrangler):**

```powershell
npx wrangler kv key put --binding=USERS_NOTIFICATION_CONFIG "user_1" "enabled"
npx wrangler kv key get --binding=USERS_NOTIFICATION_CONFIG "user_1" --text
# remote: tambah --remote
npx wrangler kv key put --binding=USERS_NOTIFICATION_CONFIG "user_1" "enabled" --remote
```

**Operasi KV (Worker):**

```ts
await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
const allKeys = await env.USERS_NOTIFICATION_CONFIG.list();
await env.USERS_NOTIFICATION_CONFIG.delete("user_2");
```

**REST API (external app):**

```powershell
curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY_NAME \
	-X PUT -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
	-d '{"value": "Some Value"}'
```

Nota:
- `wrangler dev` guna local KV secara default (data production tidak terganggu). Set `"remote": true` dalam binding untuk connect ke production.
- Deployment: `npm run deploy` → URL `kv-tutorial.<YOUR_SUBDOMAIN>.workers.dev`.

### 5.3 R2 — Object Storage

Simpan data unstructured tanpa egress bandwidth fees.

**Persediaan:** Dashboard → Storage & databases → R2 → Overview (perlu R2 subscription, ada free tier bulanan).

**Cara access (pilih satu):**

| Method | Guna bila |
|---|---|
| Workers API | App Worker baca/tulis R2 |
| S3 | Guna SDK S3-compatible dalam app sedia ada |
| CLI tools | Upload/download/manage dari terminal |
| Dashboard | Manage buckets & objects dalam browser |

**Config `wrangler.jsonc`:**

```jsonc
{
	"r2_buckets": [
		{
			"binding": "BUCKET",
			"bucket_name": "my-bucket"
		}
	]
}
```

**Guna dalam Worker:**

```ts
const object = await env.BUCKET.get(event.payload.imageKey);
const data = await object.arrayBuffer();
await env.BUCKET.put(`public/${key}`, data);
```

Fitur penting: Location Hints, CORS, Public buckets, Bucket scoped tokens.

### 5.4 Hyperdrive — Akselerasi DB Luar

Ubah regional database (Postgres/MySQL) menjadi globally distributed. Sokong AWS, Google Cloud, Azure, Neon, PlanetScale, CockroachDB, Timescale. Tak perlu tulis kod baru.

**Config `wrangler.jsonc`:**

```jsonc
{
	"compatibility_flags": ["nodejs_compat"],
	"hyperdrive": [
		{
			"binding": "HYPERDRIVE",
			"id": "<YOUR_HYPERDRIVE_ID>",
			"localConnectionString": "<LOCAL_CONNECTION_STRING>"
		}
	]
}
```

**PostgreSQL:**

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

**MySQL (perlu `disableEval: true`):**

```ts
import { createConnection } from "mysql2/promise";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const connection = await createConnection({
			host: env.HYPERDRIVE.host, user: env.HYPERDRIVE.user,
			password: env.HYPERDRIVE.password, database: env.HYPERDRIVE.database,
			port: env.HYPERDRIVE.port, disableEval: true,
		});
		const [results] = await connection.query("SHOW tables;");
		return Response.json({ results });
	},
} satisfies ExportedHandler<{ HYPERDRIVE: Hyperdrive }>;
```

Query Caching: default-on untuk popular queries.

### 5.5 Durable Objects — Stateful Compute + Storage

Gabungan compute + storage: setiap DO ada globally-unique name + durable storage (strongly consistent). Untuk koordinasi multi-client: collaborative editing, chat, multiplayer, live notifications. SQLite storage sekarang di Free plan.

**Cipta projek:** template `Worker + Durable Objects`.

**Definisi DO class (SQL API):**

```ts
export class MyDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) { super(ctx, env); }

	async sayHello(): Promise<string> {
		let result = this.ctx.storage.sql
			.exec("SELECT 'Hello, World!' as greeting").one();
		return result.greeting;
	}
}
```

**Panggil dari Worker:**

```ts
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const stub = env.MY_DURABLE_OBJECT.getByName(new URL(request.url).pathname);
		const greeting = await stub.sayHello();
		return new Response(greeting);
	},
} satisfies ExportedHandler<Env>;
```

**Config bindings + exports:**

```jsonc
{
	"durable_objects": {
		"bindings": [
			{ "name": "MY_DURABLE_OBJECT", "class_name": "MyDurableObject" }
		]
	},
	"exports": {
		"MyDurableObject": { "type": "durable-object", "storage": "sqlite" }
	}
}
```

**Deploy:**

```powershell
npx wrangler dev
npx wrangler deploy
```

Nota:
- DO tidak terima request dari Internet terus — mesti melalui Worker.
- RPC methods: public method pada class DO boleh dipanggil Worker lain.

#### SQLite Storage dalam Durable Objects

Setiap DO boleh ada **private SQLite database** (storage backend `"sqlite"`) — akses hanya oleh DO itu sendiri.

- SQLite storage + Storage API (`ctx.storage.sql`) telah **GA** (bukan lagi beta).
- SQLite-backed DO kini tersedia di **Workers Free plan** (dengan had tertentu, rujuk pricing/limits).
- Setiap DO instance = satu SQLite DB sendiri, jadi tiada contention antara instances.
- Transactional, strongly consistent, serializable storage.

**Akses SQL dalam DO:**

```ts
export class MyDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) { super(ctx, env); }

	async saveAndCount(name: string): Promise<number> {
		this.ctx.storage.sql
			.exec("INSERT INTO names (name) VALUES (?)", name);
		const row = this.ctx.storage.sql
			.exec("SELECT COUNT(*) as count FROM names").one();
		return row.count as number;
	}
}
```

**Isytihar storage backend dalam `wrangler.jsonc`:**

```jsonc
{
	"exports": {
		"MyDurableObject": {
			"type": "durable-object",
			"storage": "sqlite"
		}
	}
}
```

Nota penting:
- Class DO baru disyorkan guna config `exports` untuk SQLite storage.
- Jika guna legacy `migrations` array (cth `new_sqlite_classes`), ia cara lama untuk declare DO class.
- `migrations` masih diperlukan untuk mengurus lifecycle class (rename, delete, transfer) bagi projek sedia ada.

**Bila pilih SQLite storage vs KV-style storage (`storage: "kv"` / legacy):**

| Storage | Guna bila |
|---|---|
| `"sqlite"` | Perlu query relational dalam DO, join, aggregations, consistency kuat |
| `"kv"` (legacy default) | Simpan value ringkas sahaja, tak perlu SQL query |

---

## 6. Compute Tambahan

### 6.1 Queues — Messaging (Guaranteed Delivery)

Cipta queue → producer Worker (send) → consumer Worker (terima). Tiada caj egress.

**Cipta queue:**

```powershell
npx wrangler queues create <MY-QUEUE-NAME>
```

Nama: 1-63 chars, hanya huruf/nombor/dash, start & end dengan huruf/nombor. Tidak boleh tukar selepas cipta.

**Config producer:**

```jsonc
{
	"queues": {
		"producers": [
			{ "queue": "MY-QUEUE-NAME", "binding": "MY_QUEUE" }
		]
	}
}
```

**Producer Worker (send):**

```ts
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const log = { url: request.url, method: request.method, headers: Object.fromEntries(request.headers) };
		await env.MY_QUEUE.send(log);
		return new Response("Success!");
	},
} satisfies ExportedHandler<Env>;
```

**Consumer Worker (terima) + config:**

```ts
async queue(batch, env, ctx): Promise<void> {
	for (const message of batch.messages) {
		console.log("consumed:", JSON.stringify(message.body));
	}
}
```

```jsonc
{
	"queues": {
		"consumers": [
			{ "queue": "MY-QUEUE-NAME", "max_batch_size": 10, "max_batch_timeout": 5 }
		]
	}
}
```

- `max_batch_size` (default 10): call consumer bila 10 messages masuk.
- `max_batch_timeout` (default 5s): call consumer tiap 5 saat walaupun <10 messages.
- Satu queue = satu consumer Worker sahaja.
- Message expire default 4 hari.
- Features: batching/retries/delays, Dead Letter Queues, pull consumers (HTTP-based).

### 6.2 Workflows — Durable Multi-Step

Chained steps, auto-retry, persist state minit/jam/minggu. Untuk AI apps, data pipelines, user lifecycle, human-in-the-loop approval.

- Durable step execution tanpa timeouts
- Pause untuk external events / approvals
- Automatic retries + error handling
- Built-in observability

**API penting:** `step.do()`, `step.sleep()`, `step.sleepUntil()`, `step.waitForEvent()`.

```ts
export class ImageProcessingWorkflow extends WorkflowEntrypoint {
	async run(event: WorkflowEvent, step: WorkflowStep) {
		const imageData = await step.do('fetch image', async () => {
			const object = await this.env.BUCKET.get(event.payload.imageKey);
			return await object.arrayBuffer();
		});
		await step.waitForEvent('await approval', { event: 'approved', timeout: '24 hours' });
		await step.do('publish', async () => {
			await this.env.BUCKET.put(`public/${event.payload.imageKey}`, imageData);
		});
	}
}
```

### 6.3 Containers — Serverless Containers

Run kod apa-apa bahasa/runtime sebagai container image. **Available on Workers Paid plan.** Container instances spin up on-demand, dikawal Worker.

**Kegunaan:** workload resource-intensive, perlu full filesystem/runtime/Linux env, apps sedia ada sebagai image.

**Config `wrangler.jsonc`:**

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
	},
	"migrations": [
		{ "new_sqlite_classes": ["MyContainer"], "tag": "v1" }
	]
}
```

**Worker:**

```js
import { Container, getContainer } from "@cloudflare/containers";

export class MyContainer extends Container {
	defaultPort = 4000;
	sleepAfter = "10m";
}

export default {
	async fetch(request, env) {
		const { "session-id": sessionId } = await request.json();
		const containerInstance = getContainer(env.MY_CONTAINER, sessionId);
		return containerInstance.fetch(request);
	},
};
```

**Deploy dari mesin:**

```powershell
npx wrangler deploy
```

Nota deploy:
- Jika `image` = Dockerfile path, perlu Docker running.
- Jika `image` = registry reference (Cloudflare Registry, Docker Hub, Amazon ECR, Google Artifact Registry) — tak perlu Docker.
- Deploy pertama boleh ambil beberapa minit (provisioning image).
- Deploy tidak transactional: image build/push error boleh jadi selepas Worker live.
- `wrangler versions upload` = upload code sahaja (non-production). `wrangler deploy` = publish image + rollout.
- Preview URLs TIDAK dijana untuk Workers dengan Durable Objects (termasuk Containers).
- Cek: `npx wrangler containers list`, `npx wrangler containers images list`.

---

## 7. AI & Agents

### 7.1 Workers AI — Serverless Inference

Run ML models pada serverless GPUs. Free & Paid plans. 50+ open-source models. Pay-for-what-you-use.

**Arahan model:**

```powershell
npx wrangler ai models
```

**Config binding:**

```jsonc
{ "ai": { "binding": "AI" } }
```

**Run inference:**

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

**Deploy:**

```powershell
npx wrangler dev
npx wrangler login
npx wrangler deploy
```

Nota: Workers AI local development masih caj usage (akses akaun untuk run models).

Related: AI Gateway (caching, rate limiting, retries, model fallback), AI Search, Vectorize.

### 7.2 Vectorize — Vector Database

Globally distributed vector database untuk semantic search, recommendations, anomaly detection, RAG. Embeddings boleh dari Workers AI atau bawa sendiri (OpenAI, dll). Vectors boleh rujuk images di R2, dokumen di KV, profil di D1.

### 7.3 Agents SDK — Build AI Agents

Stateful agents dengan durable identity, SQL storage lokal, real-time WebSockets, scheduled tasks, recoverable execution. Scale hingga puluhan juta instances.

**Starter (3 arahan):**

```powershell
npx create-cloudflare@latest --template cloudflare/agents-starter
cd agents-starter && npm install
npm run dev
```

4 komponen:
1. **Communication channels** — chat, voice, email, Slack, webhooks
2. **Agent harness** — model call, tool selection, response flow (Project Think atau build sendiri)
3. **Agents SDK runtime** — Agent class, state, sessions, routing, WebSockets, scheduling, fibers, observability
4. **Tools** — Browser automation, Sandbox code execution, AI Search, MCP, Payments

### 7.4 Browser Run — Headless Browser

Headless Chrome di global network untuk automation, scraping, testing, content generation.

- **Quick Actions**: stateless tasks (screenshot, PDF, scrape, Markdown, JSON, crawl) — no code deployment, single HTTP request.
- **Browser Sessions**: full control via Puppeteer, Playwright, CDP, Stagehand.

| Use case | Guna |
|---|---|
| Simple screenshot/PDF/scrape | Quick Actions |
| Browser automation | Playwright / Puppeteer / CDP |
| AI-powered extraction | JSON endpoint |
| Site-wide crawling | Crawl endpoint |
| AI agent browsing | Playwright MCP / CDP + MCP |
| Direct control dari mana-mana env | CDP |

---

## 8. Media

### 8.1 Images — Pipeline Imej

Resize, optimize, manipulate imej di edge secara dinamik. Free & Paid.

Dua integrasi:
1. **Bring your own storage** — transform imej pada mana-mana origin (termasuk R2/S3).
2. **Hosted Images** — upload terus ke Images untuk managed solution.

Features: Optimization (compress/crop/resize), Flows (auto rules), Storage, Predefined variants.

### 8.2 Stream — Video Streaming

Upload, store, encode, deliver live & on-demand video dengan satu API. H.264 adaptive bitrate, 360p-1080p. Global network.

Features: Signed URLs (kawal akses), Direct Creator Uploads (one-time upload URL), play di mana-mana device, analytics per-creator.

### 8.3 Realtime — WebRTC

Suite untuk real-time apps:

| Produk | Untuk siapa | Effort |
|---|---|---|
| **RealtimeKit** | Dev yang nak cepat tambah video/voice tanpa WebRTC complexity | Rendah |
| **Realtime SFU** | Dev WebRTC expert yang nak full control media streams | Tinggi |
| **TURN Service** | Sambungan untuk pengguna di belakang firewall/NAT | Rendah |

---

## 9. Deployment Check & Troubleshooting

### Prosedur Check Deploy

1. Sahkan Worker deployment aktif dalam dashboard.
2. Hantar request yang mesti sampai ke resource (DB/container) dan sahkan tingkah laku.
3. Untuk Containers: `npx wrangler containers list` / `npx wrangler containers images list`.

### Troubleshooting Cepat

| Masalah | Penyelesaian |
|---|---|
| `523 errors` pada workers.dev baru | Tunggu 1 minit, errors settle sendiri |
| Build fail | Semak nama Worker = `name` dalam `wrangler.jsonc` |
| Container deploy gagal (Docker missing) | Start Docker, atau guna registry image, atau `--containers-rollout=none` |
| Container instances tak berubah | Gradual rollout masih berjalan, atau `versions upload` dipakai |
| Preview URL tak ada (Containers/DO) | Normal — guna local dev atau staging Worker |
| KV read return null dalam `wrangler dev` | Local KV kosong — set `"remote": true` atau tulis dulu lokal |

### Arahan Penting Ringkas

| Arahah | Tujuan |
|---|---|
| `npm create cloudflare@latest my-app` | Cipta projek baru |
| `npx wrangler dev` | Test lokal (localhost:8787) |
| `npx wrangler login` | Login OAuth |
| `npx wrangler deploy` | Deploy ke production |
| `npx wrangler tail` | Live logs |
| `npx wrangler versions upload` | Upload version sahaja (tanpa activate) |
| `npx wrangler d1 create X` | Cipta D1 DB |
| `npx wrangler d1 execute X --local/--remote` | Jalankan SQL lokal/remote |
| `npx wrangler kv namespace create X` | Cipta KV namespace |
| `npx wrangler kv key put/get --binding=X "K" "V"` | Tulis/baca KV |
| `npx wrangler queues create X` | Cipta queue |
| `npx wrangler containers list` | Senarai container instances |

---

## 10. Observability & Monitoring (Workers)

Observability = log, metric, dan trace untuk troubleshoot, diagnose, dan monitor kesihatan aplikasi.

### 10.1 Enable Observability

Config dalam `wrangler.jsonc`:

```jsonc
{
	"observability": { "enabled": true }
}
```

### 10.2 Logs — 4 Tahap

| Tool | Fungsi | Guna bila |
|---|---|---|
| **Workers Logs** | Auto-ingest + filter + analisa logs dalam dashboard | Logging harian, search logs lama |
| **Real-time logs** | Log events hampir masa nyata | Debugging immediate |
| **Tail Workers** (Beta, Paid/Enterprise) | Custom filter, sampling, transform telemetry | Perlukan log logic tersendiri |
| **Workers Logpush** (Paid) | Hantar logs ke destination luaran (R2, storage, logging provider) | Log retention luaran, analisis pihak ketiga |

#### 10.2.1 Workers Logs (Dashboard)

- Enable `observability` → logs auto-ingest ke dashboard Workers.
- Logs = `console.log()` + uncaught exceptions + metadata request/response.
- Data boleh dikekalkan sehingga 3 bulan (metrics).

#### 10.2.2 Real-time Logs — `wrangler tail`

```powershell
npx wrangler tail
```

- Stream log events hampir masa nyata ke terminal.
- Untuk investigate exceptions, guna `wrangler tail`.

#### 10.2.3 Tail Workers (Custom Processing)

Tail Worker = Worker khas yang menerima info execution Worker lain (producer). Available on **Paid & Enterprise**, billing by CPU time.

- Terima: HTTP statuses, data `console.log()`, uncaught exceptions, sub-requests.
- Boleh filter, ubah format, hantar ke mana-mana HTTP endpoint.
- Boleh tulis aggregated metrics ke **Analytics Engine**.

```js
export default {
	async tail(events) {
		await fetch("https://example.com/endpoint", {
			method: "POST",
			body: JSON.stringify(events),
		});
	},
};
```

Config producer Worker:

```jsonc
{
	"tail_consumers": [
		{ "service": "<TAIL_WORKER_NAME>" }
	]
}
```

Nota: Worker dalam `tail_consumers` MESTI ada `tail()` handler.

#### 10.2.4 Workers Logpush (Export Logs)

Hantar Workers Trace Event Logs ke destination luaran. Available on **Workers Paid plan**.

Enable logging pada Worker:

```jsonc
{
	"logpush": true
}
```

Dataset: `workers_trace_events` — metadata request/response, `console.log()` messages, uncaught exceptions.

Cipta Logpush job (dashboard):
1. **Logpush** → **Create a Logpush job**
2. Pilih destination (R2, S3, dll)
3. Pilih dataset **Workers trace events**

Sokong **filters** + **sampling rate** untuk kawal volume data.

Nota penting: `logs` + `exceptions` fields had 16,384 aksara — selepas itu dipotong (`<<<Logpush: truncated>>>`).

### 10.3 Metrics & Analytics (Dashboard)

#### Workers Metrics (per Worker)

View: dashboard → **Workers & Pages** → pilih Worker → Metrics.

| Chart | Fungsi |
|---|---|
| **Requests** | Total / Success / Errors / Subrequests |
| **Subrequests** | `fetch()` dalam Worker: cached vs uncached |
| **Wall time per execution** | Masa JS context buka (termasuk I/O + `waitUntil()`) |
| **CPU time per execution** | Penggunaan CPU quantiles |
| **Execution duration** (GB-seconds) | Duration per invocation |
| **Memory usage** | V8 isolate memory (P50-P999) — **128 MB limit** |
| **Request duration** | Hanya bila **Smart Placement** diaktifkan |

**Invocation statuses** (bukan HTTP status):

| Status | Maksud | Error code |
|---|---|---|
| Success | Worker berjaya | — |
| Client disconnected | Browser putus sebelum siap | — |
| Worker threw exception | Unhandled JS exception | 1101 |
| Exceeded resources | Melebihi runtime limits (lazimnya CPU) | 1102, 1027 |
| Internal error | Runtime internal failure (jarang) | — |

Metrics retention: sehingga 3 bulan, maksimum increment seminggu.

#### Zone Analytics (per zone)

Aggregate semua Workers dalam zone:
- Subrequests (cached/uncached)
- Bandwidth (cache status)
- Status codes
- Total requests

#### Custom Analytics — Analytics Engine

Untuk metrics aplikasi sendiri (bukan runtime):
- Custom business metrics (signups, purchases)
- Per-customer analytics (high-cardinality: customer IDs, API keys)
- Usage-based billing
- Performance tracking

Writes non-blocking (tak tambah latency). Query guna SQL API atau Grafana.

```js
env.ANALYTICS.writeDataPoint({
	blobs: [event.scriptName, event.outcome],
	doubles: [1],
	indexes: [event.event?.request?.cf?.colo ?? "unknown"],
});
```

### 10.4 Troubleshooting Errors

| Error code | Maksud | Tindakan |
|---|---|---|
| 1101 | Worker threw exception | Semak unhandled JS exception, guna `wrangler tail` |
| 1102 | Exceeded resources (CPU/startup) | Optimize kod, kurangkan CPU time |
| 1027 | Exceeded resources (free tier) | Upgrade plan atau optimize |
| 523 | workers.dev baru belum ready | Tunggu seminit |

---

## 11. Fail Konfigurasi Rujukan (`wrangler.jsonc` Lengkap)

```jsonc
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"name": "my-app",
	"main": "src/index.ts",
	"compatibility_date": "2025-02-04",
	"compatibility_flags": ["nodejs_compat"],
	"observability": { "enabled": true },

	"vars": { "APP_NAME": "my-app" },

	"d1_databases": [
		{ "binding": "DB", "database_name": "my-db", "database_id": "<id>" }
	],
	"kv_namespaces": [
		{ "binding": "KV", "id": "<id>" }
	],
	"r2_buckets": [
		{ "binding": "BUCKET", "bucket_name": "my-bucket" }
	],
	"hyperdrive": [
		{ "binding": "HYPERDRIVE", "id": "<id>", "localConnectionString": "<conn>" }
	],
	"ai": { "binding": "AI" },
	"queues": {
		"producers": [ { "queue": "my-queue", "binding": "MY_QUEUE" } ],
		"consumers": [ { "queue": "my-queue", "max_batch_size": 10, "max_batch_timeout": 5 } ]
	},
	"durable_objects": {
		"bindings": [ { "name": "MY_DO", "class_name": "MyDurableObject" } ]
	},
	"exports": {
		"MyDurableObject": { "type": "durable-object", "storage": "sqlite" }
	},
	"containers": [
		{ "class_name": "MyContainer", "image": "./Dockerfile", "max_instances": 5 }
	]
}
```

---

## 12. Suggestion Penggunaan Produk

Jadual rujukan cepat: pilih produk mana untuk guna bagi setiap keperluan.

### Pilih Storage / Database

| Produk | Guna bila | Contoh use case | Jangan guna bila |
|---|---|---|---|
| **D1** (SQLite serverless) | Perlukan relational data, query kompleks, joins, transaksi | Users, orders, transactions, data dengan hubungan antara entiti | Simpan data sementara / cache sahaja |
| **KV** (key-value) | Read-heavy, nilai kecil, low-latency global | Cache API response, user preferences, routing config, auth tokens | Data besar, write-heavy, perlu consistency ketat |
| **R2** (object storage) | Simpan file besar / unstructured | Gambar, video, dokumen, backup, data lakes, ML artifacts | Data yang perlu di-query relational |
| **Durable Objects** | Perlukan state bersama + real-time coordination + SQLite private storage setiap instance | Chat, multiplayer, collaborative editing, live notifications, rate limiting per-user | State ringkas yang tak perlu coordination |
| **Hyperdrive** | Dah ada DB luaran (Postgres/MySQL) & nak akselerasi | Connect ke AWS RDS, Neon, PlanetScale, MySQL sedia ada | Belum ada DB luaran — guna D1 lebih mudah |
| **Vectorize** | Perlukan semantic search / similarity | RAG, recommendation, anomaly detection, search embeddings | Perlukan search keyword biasa sahaja |

### Pilih Compute / Background Jobs

| Produk | Guna bila | Contoh use case | Jangan guna bila |
|---|---|---|---|
| **Workers** | HTTP handler, API, full-stack apps | REST API, frontend + backend, webhooks | Perlukan long-running process dengan state |
| **Queues** | Kerja background asynchronous | Email send, image processing, log pipeline, data batching | Kerja yang perlu jawapan segera (synchronous) |
| **Workflows** | Multi-step durable, boleh retry, tahan lama | Data pipelines, user onboarding, human approval, trial expiry | Simple task sekali jalan — Queues lebih ringan |
| **Containers** | Perlukan runtime/full filesystem, workload berat | Kod Python/Ruby legacy, CPU-intensive, apps yang dah ada image | Boleh buat dalam Worker biasa (lebih murah & cepat) |

### Pilih AI / Agents

| Produk | Guna bila | Contoh use case | Jangan guna bila |
|---|---|---|---|
| **Workers AI** | Perlukan ML inference serverless | Text generation, image classification, object detection | Perlukan model custom/private (guna Workers AI custom atau API luar) |
| **Vectorize** | Perlukan embedding search | Semantic search, RAG dengan data sendiri | Search biasa tanpa embeddings |
| **Agents SDK** | Perlukan AI agent stateful dengan memory + tools | Chat agent, email agent, browser agent, Slack agent | Perlukan satu-off inference sahaja (guna Workers AI) |
| **Browser Run** | Perlukan headless browser | Screenshot, scraping, PDF, web testing, crawl | Perlukan rendering server-side sahaja |

### Pilih Media

| Produk | Guna bila | Contoh use case | Jangan guna bila |
|---|---|---|---|
| **Images** | Perlu optimize/resize/deliver imej | Avatar, product images, responsive images | Perlukan video playback |
| **Stream** | Perlu video upload/streaming | Video platform, live streaming, on-demand video | Imej statik sahaja |
| **Realtime** | Perlu live video/voice (WebRTC) | Video call, voice chat, live streaming interaktif | Streaming video biasa (guna Stream) |

### Pilih Gabungan (Senario App Penuh)

| Senario | Gabungan Produk |
|---|---|
| **Full-stack web app** | Workers + D1 (data) + KV (cache/session) + R2 (uploads) |
| **AI Chatbot** | Workers + Workers AI (LLM) + D1 (history) + Vectorize (knowledge base) |
| **Media platform** | Workers + R2 + Stream + Images |
| **E-commerce** | Workers + D1 (orders/products) + KV (cart/cache) + Queues (email/order processing) + R2 (product images) |
| **Real-time collaboration** | Workers + Durable Objects + Realtime |
| **AI agent dengan tools** | Agents SDK + Workers AI + Browser Run + D1 + Vectorize |

---

## 13. Nota & Catatan Lanjut

- Dokumen index lengkap setiap produk boleh diambil: `<produk>/llms.txt`
  (cth: `https://developers.cloudflare.com/workers/llms.txt`)
- Setiap produk ada page pricing & limits tersendiri.
- Gunakan dashboard pautan terus untuk akses cepat:
  - Workers & Pages: https://dash.cloudflare.com/?to=/:account/workers-and-pages
  - D1: https://dash.cloudflare.com/?to=/:account/workers/d1
  - KV: https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces
  - R2: https://dash.cloudflare.com/?to=/:account/r2/overview
  - Stream: https://dash.cloudflare.com/?to=/:account/stream
  - Containers: https://dash.cloudflare.com/?to=/:account/workers/containers
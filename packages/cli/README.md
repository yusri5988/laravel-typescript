# hono-laravel

Scaffold the Hono Laravel application for local development.

```powershell
mkdir my-hono-app
cd my-hono-app
npx hono-laravel setup
npm run dev
```

The setup creates a local `.dev.vars`, installs dependencies, builds frontend assets, and applies local D1 migrations. The local Worker runs at `http://127.0.0.1:8787`.

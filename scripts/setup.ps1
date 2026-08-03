param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseName,
  [string]$ConfigPath = "wrangler.jsonc"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating the Cloudflare D1 database '$DatabaseName'..."
npx wrangler d1 create $DatabaseName

Write-Host "`nCopy the returned database_id into $ConfigPath, then run:"
Write-Host "  npx wrangler types"
Write-Host "  npx wrangler secret put JWT_SECRET"
Write-Host "  npx wrangler d1 migrations apply $DatabaseName --remote"
Write-Host "  npm run deploy"

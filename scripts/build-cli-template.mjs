import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const cliRoot = path.join(projectRoot, 'packages', 'cli')
const templateRoot = path.join(cliRoot, 'template')

const excludedDirectories = new Set([
  '.git',
  '.vitest',
  '.wrangler',
  'coverage',
  'dist',
  'node_modules',
  'packages',
  'wrangler-local-state',
])

function shouldCopy(sourcePath) {
  const relativePath = path.relative(projectRoot, sourcePath)
  if (!relativePath) return true

  const normalizedPath = relativePath.split(path.sep).join('/')
  const segments = normalizedPath.split('/')
  const fileName = segments.at(-1)

  if (segments.some((segment) => excludedDirectories.has(segment))) return false
  if (normalizedPath === 'src/dist' || normalizedPath.startsWith('src/dist/')) return false
  if (normalizedPath === 'packages/cli/template') return false
  if (normalizedPath === 'package-lock.json') return false
  if (normalizedPath === 'scripts/build-cli-template.mjs') return false
  if (fileName === '.dev.vars') return false
  if (fileName?.startsWith('.env.') && fileName !== '.env.example') return false
  if (fileName === '.env') return false

  return true
}

await mkdir(cliRoot, { recursive: true })
const stagingRoot = await mkdtemp(path.join(tmpdir(), 'hono-laravel-template-'))
const stagingTemplate = path.join(stagingRoot, 'template')

try {
  await cp(projectRoot, stagingTemplate, {
    recursive: true,
    filter: shouldCopy,
  })
  await rm(templateRoot, { recursive: true, force: true })
  await cp(stagingTemplate, templateRoot, { recursive: true })
} finally {
  await rm(stagingRoot, { recursive: true, force: true })
}

const templatePackagePath = path.join(templateRoot, 'package.json')
const templatePackage = JSON.parse(await readFile(templatePackagePath, 'utf8'))
delete templatePackage.scripts['build:cli-template']
delete templatePackage.scripts['pack:cli']
await writeFile(templatePackagePath, `${JSON.stringify(templatePackage, null, 2)}\n`, 'utf8')

const templateGitignorePath = path.join(templateRoot, '.gitignore')
const templateGitignore = await readFile(templateGitignorePath, 'utf8')
await writeFile(path.join(templateRoot, 'gitignore'), templateGitignore, 'utf8')
await rm(templateGitignorePath)

console.log(`CLI template generated at ${path.relative(projectRoot, templateRoot)}`)

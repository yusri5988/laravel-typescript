#!/usr/bin/env node

import { randomBytes } from 'node:crypto'
import { access, cp, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templateRoot = path.join(cliRoot, 'template')

function printHelp() {
  console.log(`Usage:
  npx hono-laravel setup [directory]

Options:
  --force          Allow setup in a non-empty directory
  --skip-install   Skip npm install
  --skip-migrate   Skip local D1 migrations
  --help           Show this help`)
}

function run(command, args, cwd, options = {}) {
  const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command
  const result = spawnSync(executable, args, {
    cwd,
    stdio: options.input === undefined ? 'inherit' : ['pipe', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
    input: options.input,
  })

  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}.`)
  }
}

async function isDirectoryEmpty(directory) {
  return (await readdir(directory)).length === 0
}

async function createLocalVars(targetDirectory) {
  const varsPath = path.join(targetDirectory, '.dev.vars')

  try {
    await access(varsPath)
    return false
  } catch {
    await writeFile(
      varsPath,
      `JWT_SECRET=${randomBytes(32).toString('hex')}\nCORS_ORIGIN=http://127.0.0.1:8787\n`,
      'utf8',
    )
    return true
  }
}

async function setup(args) {
  const nodeMajorVersion = Number(process.versions.node.split('.')[0])
  if (nodeMajorVersion < 20) {
    throw new Error(`Node.js 20 or newer is required. Found ${process.versions.node}.`)
  }

  const force = args.includes('--force')
  const skipInstall = args.includes('--skip-install')
  const skipMigrate = args.includes('--skip-migrate')
  const targetArgument = args.find((argument) => !argument.startsWith('--'))
  const targetDirectory = path.resolve(process.cwd(), targetArgument ?? '.')

  await mkdir(targetDirectory, { recursive: true })

  if (!force && !(await isDirectoryEmpty(targetDirectory))) {
    throw new Error(`Target directory is not empty: ${targetDirectory}. Use an empty folder or --force.`)
  }

  await cp(templateRoot, targetDirectory, {
    recursive: true,
    force: true,
  })

  const packagedGitignore = path.join(targetDirectory, 'gitignore')
  const targetGitignore = path.join(targetDirectory, '.gitignore')
  await access(packagedGitignore)
  await rm(targetGitignore, { force: true })
  await rename(packagedGitignore, targetGitignore)

  const varsCreated = await createLocalVars(targetDirectory)
  console.log(`Project files copied to ${targetDirectory}`)
  if (varsCreated) console.log('Created local .dev.vars with a random JWT secret.')

  if (!skipInstall) {
    console.log('\nInstalling dependencies...')
    run('npm', ['install'], targetDirectory)
  }

  console.log('\nBuilding frontend assets...')
  run('npm', ['run', 'build:frontend'], targetDirectory)

  if (!skipMigrate) {
    console.log('\nApplying local D1 migrations...')
    run('npm', ['run', 'db:migrate'], targetDirectory, { input: 'yes\n' })
  }

  console.log('\nSetup complete.')
  console.log('Run `npm run dev`, then open http://127.0.0.1:8787')
}

const [command, ...args] = process.argv.slice(2)

try {
  if (!command || command === '--help' || command === 'help') {
    printHelp()
  } else if (command === 'setup') {
    await setup(args)
  } else {
    throw new Error(`Unknown command: ${command}`)
  }
} catch (error) {
  console.error(`\nSetup failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}

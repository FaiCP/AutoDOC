import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'
import { execSync } from 'node:child_process'
import type { ProjectMetadata } from '../types.js'

function readJson(path: string): Record<string, unknown> | null {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return null }
}

function readFile(path: string): string | null {
  try { return readFileSync(path, 'utf8') } catch { return null }
}

function has(root: string, ...parts: string[]): boolean {
  return existsSync(join(root, ...parts))
}

function hasCsproj(root: string): boolean {
  try {
    return readdirSync(root, { withFileTypes: true })
      .some(e => e.isFile() && (e.name.endsWith('.csproj') || e.name.endsWith('.sln')))
  } catch { return false }
}

function gitRemote(root: string): string | undefined {
  try {
    return execSync('git config --get remote.origin.url', {
      cwd: root, stdio: ['pipe', 'pipe', 'pipe'],
    }).toString().trim() || undefined
  } catch { return undefined }
}

function gitBranch(root: string): string | undefined {
  try {
    return execSync('git branch --show-current', {
      cwd: root, stdio: ['pipe', 'pipe', 'pipe'],
    }).toString().trim() || undefined
  } catch { return undefined }
}

function detectLicense(root: string): string | undefined {
  const content = readFile(join(root, 'LICENSE'))
    ?? readFile(join(root, 'LICENSE.md'))
    ?? readFile(join(root, 'LICENSE.txt'))
  if (!content) return undefined
  if (content.includes('MIT License')) return 'MIT'
  if (content.includes('Apache License')) return 'Apache-2.0'
  if (content.includes('GNU GENERAL PUBLIC LICENSE')) return 'GPL-3.0'
  if (content.includes('ISC License')) return 'ISC'
  if (content.includes('BSD')) return 'BSD'
  return 'custom'
}

function detectEnvVars(root: string): string[] {
  const content = readFile(join(root, '.env.example'))
    ?? readFile(join(root, '.env.sample'))
  if (!content) return []
  return content
    .split('\n')
    .map(l => l.split('=')[0].trim())
    .filter(l => l.length > 0 && !l.startsWith('#'))
}

function detectNodeSubStacks(deps: Set<string>): string[] {
  const stacks: string[] = []
  if (deps.has('react')) stacks.push('React')
  if (deps.has('vue')) stacks.push('Vue')
  if (deps.has('@angular/core')) stacks.push('Angular')
  if (deps.has('next')) stacks.push('Next.js')
  if (deps.has('nuxt') || deps.has('@nuxt/core')) stacks.push('Nuxt')
  if (deps.has('svelte') || deps.has('@sveltejs/kit')) stacks.push('Svelte')
  if (deps.has('typescript')) stacks.push('TypeScript')
  if (deps.has('tailwindcss')) stacks.push('Tailwind CSS')
  if (deps.has('vite')) stacks.push('Vite')
  if (deps.has('express')) stacks.push('Express')
  if (deps.has('fastify')) stacks.push('Fastify')
  if (deps.has('@nestjs/core')) stacks.push('NestJS')
  if (deps.has('electron')) stacks.push('Electron')
  return stacks
}

const WANTED_SCRIPTS = ['install', 'dev', 'start', 'test', 'build', 'lint', 'preview', 'typecheck']

export function detect(root: string): ProjectMetadata {
  const stacks: string[] = []
  let name = ''
  let description = ''
  let version: string | undefined
  let packageManager: string | undefined
  const scripts: Record<string, string> = {}

  const pkg = readJson(join(root, 'package.json')) as {
    name?: string
    description?: string
    version?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  } | null

  if (pkg) {
    stacks.push('Node.js')
    name = pkg.name ?? ''
    description = pkg.description ?? ''
    version = pkg.version

    const allDeps = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ])
    stacks.push(...detectNodeSubStacks(allDeps))

    for (const s of WANTED_SCRIPTS) {
      if (pkg.scripts?.[s]) scripts[s] = pkg.scripts[s]
    }

    if (has(root, 'pnpm-lock.yaml')) packageManager = 'pnpm'
    else if (has(root, 'yarn.lock')) packageManager = 'yarn'
    else if (has(root, 'bun.lockb') || has(root, 'bun.lock')) packageManager = 'bun'
    else packageManager = 'npm'
  }

  if (has(root, 'pyproject.toml') || has(root, 'requirements.txt') || has(root, 'setup.py')) {
    stacks.push('Python')
    if (has(root, 'poetry.lock')) packageManager = packageManager ?? 'poetry'
    else if (has(root, 'uv.lock')) packageManager = packageManager ?? 'uv'
  }

  if (has(root, 'go.mod')) stacks.push('Go')
  if (has(root, 'Cargo.toml')) stacks.push('Rust')
  if (has(root, 'pom.xml') || has(root, 'build.gradle') || has(root, 'build.gradle.kts')) stacks.push('Java')
  if (hasCsproj(root)) stacks.push('.NET')
  if (has(root, 'composer.json')) stacks.push('PHP')

  if (!name) name = basename(root)

  return {
    name,
    description,
    version,
    license: detectLicense(root),
    gitRemote: gitRemote(root),
    gitBranch: gitBranch(root),
    stacks,
    packageManager,
    scripts,
    envVars: detectEnvVars(root),
    hasDocker: has(root, 'Dockerfile'),
    hasDockerCompose: has(root, 'docker-compose.yml') || has(root, 'docker-compose.yaml'),
  }
}

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { detect } from '../dist/detectors/index.js'

function tmp(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'autoreadme-'))
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), typeof content === 'string' ? content : JSON.stringify(content))
  }
  return dir
}

test('detects Node.js + npm from package.json + package-lock.json', () => {
  const dir = tmp({
    'package.json': { name: 'my-app', description: 'Test app', version: '1.0.0' },
    'package-lock.json': '{}',
  })
  try {
    const meta = detect(dir)
    assert.equal(meta.name, 'my-app')
    assert.equal(meta.description, 'Test app')
    assert.ok(meta.stacks.includes('Node.js'))
    assert.equal(meta.packageManager, 'npm')
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects React, TypeScript, Vite, Tailwind from dependencies', () => {
  const dir = tmp({
    'package.json': {
      name: 'react-app',
      dependencies: { react: '^19.0.0' },
      devDependencies: { typescript: '^5.0.0', vite: '^5.0.0', tailwindcss: '^4.0.0' },
    },
    'package-lock.json': '{}',
  })
  try {
    const meta = detect(dir)
    assert.ok(meta.stacks.includes('React'))
    assert.ok(meta.stacks.includes('TypeScript'))
    assert.ok(meta.stacks.includes('Vite'))
    assert.ok(meta.stacks.includes('Tailwind CSS'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects pnpm from pnpm-lock.yaml', () => {
  const dir = tmp({
    'package.json': { name: 'pnpm-app' },
    'pnpm-lock.yaml': 'lockfileVersion: 6',
  })
  try {
    const meta = detect(dir)
    assert.equal(meta.packageManager, 'pnpm')
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects yarn from yarn.lock', () => {
  const dir = tmp({
    'package.json': { name: 'yarn-app' },
    'yarn.lock': '# yarn lockfile v1',
  })
  try {
    const meta = detect(dir)
    assert.equal(meta.packageManager, 'yarn')
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects Python from pyproject.toml', () => {
  const dir = tmp({ 'pyproject.toml': '[project]\nname = "myapp"' })
  try {
    const meta = detect(dir)
    assert.ok(meta.stacks.includes('Python'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects Go from go.mod', () => {
  const dir = tmp({ 'go.mod': 'module example.com/app' })
  try {
    const meta = detect(dir)
    assert.ok(meta.stacks.includes('Go'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects Rust from Cargo.toml', () => {
  const dir = tmp({ 'Cargo.toml': '[package]\nname = "myapp"' })
  try {
    const meta = detect(dir)
    assert.ok(meta.stacks.includes('Rust'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects PHP from composer.json', () => {
  const dir = tmp({ 'composer.json': '{"name":"vendor/app"}' })
  try {
    const meta = detect(dir)
    assert.ok(meta.stacks.includes('PHP'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects MIT license', () => {
  const dir = tmp({ 'LICENSE': 'MIT License\nCopyright (c) 2024' })
  try {
    const meta = detect(dir)
    assert.equal(meta.license, 'MIT')
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects env vars from .env.example', () => {
  const dir = tmp({ '.env.example': 'DATABASE_URL=\nAPI_KEY=\n# comment\nSECRET=' })
  try {
    const meta = detect(dir)
    assert.deepEqual(meta.envVars, ['DATABASE_URL', 'API_KEY', 'SECRET'])
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects Dockerfile', () => {
  const dir = tmp({ 'Dockerfile': 'FROM node:20' })
  try {
    const meta = detect(dir)
    assert.ok(meta.hasDocker)
    assert.ok(!meta.hasDockerCompose)
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects docker-compose', () => {
  const dir = tmp({ 'docker-compose.yml': 'version: "3"' })
  try {
    const meta = detect(dir)
    assert.ok(meta.hasDockerCompose)
  } finally { rmSync(dir, { recursive: true }) }
})

test('uses directory name when package.json has no name', () => {
  const dir = tmp({ 'package.json': '{}' })
  try {
    const meta = detect(dir)
    assert.ok(meta.name.length > 0)
  } finally { rmSync(dir, { recursive: true }) }
})

test('detects scripts from package.json', () => {
  const dir = tmp({
    'package.json': {
      name: 'app',
      scripts: { dev: 'vite', build: 'tsc', test: 'jest', lint: 'eslint .' },
    },
  })
  try {
    const meta = detect(dir)
    assert.equal(meta.scripts['dev'], 'vite')
    assert.equal(meta.scripts['build'], 'tsc')
    assert.equal(meta.scripts['test'], 'jest')
    assert.equal(meta.scripts['lint'], 'eslint .')
  } finally { rmSync(dir, { recursive: true }) }
})

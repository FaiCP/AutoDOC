import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { generateBlock, applyToReadme } from '../dist/generators/readme.js'
import { runGenerate } from '../dist/commands/generate.js'

const BASE_META = {
  name: 'my-app',
  description: '',
  stacks: [],
  packageManager: undefined,
  scripts: {},
  envVars: [],
  hasDocker: false,
  hasDockerCompose: false,
  topLevelDirs: [],
}

function tmp(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'autoreadme-'))
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content)
  }
  return dir
}

// generateBlock tests
test('generateBlock includes project name as h1', () => {
  const block = generateBlock({ ...BASE_META, name: 'cool-project' })
  assert.ok(block.startsWith('# cool-project'))
})

test('generateBlock includes overview when description present', () => {
  const block = generateBlock({ ...BASE_META, description: 'A cool tool' })
  assert.ok(block.includes('## Overview'))
  assert.ok(block.includes('A cool tool'))
})

test('generateBlock omits overview when no description', () => {
  const block = generateBlock({ ...BASE_META, description: '' })
  assert.ok(!block.includes('## Overview'))
})

test('generateBlock includes tech stack section', () => {
  const block = generateBlock({ ...BASE_META, stacks: ['Node.js', 'React'] })
  assert.ok(block.includes('## Tech Stack'))
  assert.ok(block.includes('- Node.js'))
  assert.ok(block.includes('- React'))
})

test('generateBlock includes commands table', () => {
  const block = generateBlock({ ...BASE_META, packageManager: 'npm', scripts: { build: 'tsc', test: 'jest' } })
  assert.ok(block.includes('## Commands'))
  assert.ok(block.includes('npm run build'))
  assert.ok(block.includes('npm run test'))
})

test('generateBlock includes env vars table', () => {
  const block = generateBlock({ ...BASE_META, envVars: ['API_KEY', 'SECRET'] })
  assert.ok(block.includes('## Environment Variables'))
  assert.ok(block.includes('`API_KEY`'))
})

test('generateBlock includes docker section when Dockerfile exists', () => {
  const block = generateBlock({ ...BASE_META, hasDocker: true })
  assert.ok(block.includes('## Docker'))
  assert.ok(block.includes('docker build'))
})

test('generateBlock includes contributing section', () => {
  const block = generateBlock({ ...BASE_META })
  assert.ok(block.includes('## Contributing'))
  assert.ok(block.includes('git checkout -b'))
})

// applyToReadme tests
test('applyToReadme wraps block in markers when no existing file', () => {
  const result = applyToReadme(null, '# Test', false)
  assert.ok(result.includes('<!-- AUTOREADME:START -->'))
  assert.ok(result.includes('# Test'))
  assert.ok(result.includes('<!-- AUTOREADME:END -->'))
})

test('applyToReadme replaces content between markers', () => {
  const existing = '<!-- AUTOREADME:START -->\n# Old\n<!-- AUTOREADME:END -->\n\nManual content'
  const result = applyToReadme(existing, '# New', false)
  assert.ok(result.includes('# New'))
  assert.ok(!result.includes('# Old'))
  assert.ok(result.includes('Manual content'))
})

test('applyToReadme preserves manual content before markers', () => {
  const existing = 'Manual before\n<!-- AUTOREADME:START -->\n# Old\n<!-- AUTOREADME:END -->'
  const result = applyToReadme(existing, '# New', false)
  assert.ok(result.startsWith('Manual before'))
  assert.ok(result.includes('# New'))
})

test('applyToReadme prepends when no markers and no force', () => {
  const result = applyToReadme('# Manual README', '# Generated', false)
  assert.ok(result.includes('<!-- AUTOREADME:START -->'))
  assert.ok(result.includes('# Manual README'))
  assert.ok(result.includes('# Generated'))
})

test('applyToReadme replaces all when force and no markers', () => {
  const result = applyToReadme('# Manual README', '# Generated', true)
  assert.ok(!result.includes('# Manual README'))
  assert.ok(result.includes('# Generated'))
})

// runGenerate integration tests
test('runGenerate creates README.md when none exists', () => {
  const dir = tmp({ 'package.json': JSON.stringify({ name: 'test-app' }) })
  try {
    runGenerate({ path: dir, dryRun: false, force: false, backup: false })
    assert.ok(existsSync(join(dir, 'README.md')))
    const content = readFileSync(join(dir, 'README.md'), 'utf8')
    assert.ok(content.includes('# test-app'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('runGenerate dry-run does not write file', () => {
  const dir = tmp({})
  try {
    runGenerate({ path: dir, dryRun: true, force: false, backup: false })
    assert.ok(!existsSync(join(dir, 'README.md')))
  } finally { rmSync(dir, { recursive: true }) }
})

test('runGenerate --backup creates .bak file', () => {
  const dir = tmp({ 'README.md': '# Original' })
  try {
    runGenerate({ path: dir, dryRun: false, force: false, backup: true })
    assert.ok(existsSync(join(dir, 'README.md.bak')))
    const bak = readFileSync(join(dir, 'README.md.bak'), 'utf8')
    assert.equal(bak, '# Original')
  } finally { rmSync(dir, { recursive: true }) }
})

test('runGenerate updates markers on second run', () => {
  const dir = tmp({ 'package.json': JSON.stringify({ name: 'test-app', description: 'v1' }) })
  try {
    runGenerate({ path: dir, dryRun: false, force: false, backup: false })
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'test-app', description: 'v2' }))
    runGenerate({ path: dir, dryRun: false, force: false, backup: false })
    const content = readFileSync(join(dir, 'README.md'), 'utf8')
    assert.ok(content.includes('v2'))
    assert.ok(!content.includes('v1'))
    assert.equal((content.match(/AUTOREADME:START/g) ?? []).length, 1)
  } finally { rmSync(dir, { recursive: true }) }
})

test('runGenerate preserves manual content outside markers', () => {
  const dir = tmp({
    'package.json': JSON.stringify({ name: 'test-app' }),
    'README.md': '<!-- AUTOREADME:START -->\n# Old\n<!-- AUTOREADME:END -->\n\n## Manual Section\n\nHand-written content.',
  })
  try {
    runGenerate({ path: dir, dryRun: false, force: false, backup: false })
    const content = readFileSync(join(dir, 'README.md'), 'utf8')
    assert.ok(content.includes('Hand-written content.'))
    assert.ok(content.includes('# test-app'))
  } finally { rmSync(dir, { recursive: true }) }
})

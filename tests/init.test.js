import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { runInit } from '../dist/commands/init.js'

function tmp() {
  return mkdtempSync(join(tmpdir(), 'autoreadme-'))
}

test('creates workflow file at .github/workflows/autoreadme.yml', () => {
  const dir = tmp()
  try {
    runInit({ githubAction: true, path: dir, force: false })
    const path = join(dir, '.github', 'workflows', 'autoreadme.yml')
    assert.ok(existsSync(path))
    const content = readFileSync(path, 'utf8')
    assert.ok(content.includes('npx autoreadme generate'))
    assert.ok(content.includes('stefanzweifel/git-auto-commit-action'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('workflow file includes correct trigger and permissions', () => {
  const dir = tmp()
  try {
    runInit({ githubAction: true, path: dir, force: false })
    const content = readFileSync(join(dir, '.github', 'workflows', 'autoreadme.yml'), 'utf8')
    assert.ok(content.includes('on:'))
    assert.ok(content.includes('contents: write'))
    assert.ok(content.includes('actions/checkout'))
    assert.ok(content.includes('actions/setup-node'))
  } finally { rmSync(dir, { recursive: true }) }
})

test('throws when workflow exists and no --force', () => {
  const dir = tmp()
  try {
    runInit({ githubAction: true, path: dir, force: false })
    assert.throws(
      () => runInit({ githubAction: true, path: dir, force: false }),
      /already exists/
    )
  } finally { rmSync(dir, { recursive: true }) }
})

test('overwrites existing workflow with --force', () => {
  const dir = tmp()
  try {
    runInit({ githubAction: true, path: dir, force: false })
    assert.doesNotThrow(() => runInit({ githubAction: true, path: dir, force: true }))
  } finally { rmSync(dir, { recursive: true }) }
})

test('throws when --github-action flag not set', () => {
  const dir = tmp()
  try {
    assert.throws(
      () => runInit({ githubAction: false, path: dir, force: false }),
      /--github-action/
    )
  } finally { rmSync(dir, { recursive: true }) }
})

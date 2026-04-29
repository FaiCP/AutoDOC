import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { detect } from '../detectors/index.js'
import { generateBlock, applyToReadme } from '../generators/readme.js'

interface GenerateOptions {
  dryRun: boolean
  force: boolean
  backup: boolean
  path: string
}

export function runGenerate(opts: GenerateOptions): void {
  const root = resolve(opts.path)
  const readmePath = join(root, 'README.md')

  const meta = detect(root)
  const block = generateBlock(meta)

  const existing = existsSync(readmePath)
    ? readFileSync(readmePath, 'utf8')
    : null

  const result = applyToReadme(existing, block, opts.force)

  if (opts.dryRun) {
    console.log('[dry-run] README.md would be written:')
    console.log('---')
    console.log(result)
    console.log('---')
    return
  }

  if (opts.backup && existing) {
    const backupPath = readmePath + '.bak'
    copyFileSync(readmePath, backupPath)
    console.log(`Backup saved: ${backupPath}`)
  }

  writeFileSync(readmePath, result, 'utf8')
  console.log(`README.md updated: ${readmePath}`)
}

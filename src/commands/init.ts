import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { WORKFLOW } from '../templates/workflow.js'

interface InitOptions {
  githubAction: boolean
  path: string
  force: boolean
}

export function runInit(opts: InitOptions): void {
  if (!opts.githubAction) {
    console.error('Specify --github-action to generate the workflow file.')
    process.exit(1)
  }

  const root = resolve(opts.path)
  const workflowDir = join(root, '.github', 'workflows')
  const workflowPath = join(workflowDir, 'autoreadme.yml')

  if (existsSync(workflowPath) && !opts.force) {
    console.error(`Workflow already exists: ${workflowPath}`)
    console.error('Use --force to overwrite.')
    process.exit(1)
  }

  mkdirSync(workflowDir, { recursive: true })
  writeFileSync(workflowPath, WORKFLOW, 'utf8')
  console.log(`Workflow created: ${workflowPath}`)
}

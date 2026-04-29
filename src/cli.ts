#!/usr/bin/env node
import { Command } from 'commander'
import { runDetect } from './commands/detect.js'
import { runGenerate } from './commands/generate.js'
import { runInit } from './commands/init.js'

const program = new Command()

program
  .name('autoreadme')
  .description('Generate and update README.md automatically from project metadata')
  .version('0.1.0')

program
  .command('detect')
  .description('Print detected project metadata as JSON')
  .option('-p, --path <path>', 'project root', '.')
  .action((opts: { path: string }) => {
    runDetect(opts.path)
  })

program
  .command('generate')
  .description('Create or update README.md')
  .option('-p, --path <path>', 'project root', '.')
  .option('--dry-run', 'preview changes without writing', false)
  .option('--force', 'overwrite existing README without markers', false)
  .option('--backup', 'create README.md.bak before writing', false)
  .action((opts: { path: string; dryRun: boolean; force: boolean; backup: boolean }) => {
    runGenerate({
      path: opts.path,
      dryRun: opts.dryRun,
      force: opts.force,
      backup: opts.backup,
    })
  })

program
  .command('init')
  .description('Install optional GitHub Actions workflow')
  .option('-p, --path <path>', 'project root', '.')
  .option('--github-action', 'generate .github/workflows/autoreadme.yml', false)
  .option('--force', 'overwrite existing workflow', false)
  .action((opts: { path: string; githubAction: boolean; force: boolean }) => {
    runInit({
      path: opts.path,
      githubAction: opts.githubAction,
      force: opts.force,
    })
  })

program.parse()

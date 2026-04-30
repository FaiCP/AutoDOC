import type { ProjectMetadata } from '../types.js'
import { parseGitHub, githubBadges, stackBadges, stackEmoji } from './badges.js'

export function sectionHeader(meta: ProjectMetadata): string {
  const emoji = stackEmoji(meta.stacks)
  const lines: string[] = []

  lines.push(`<p align="center">`)
  lines.push(`  <h1>${emoji} ${meta.name}</h1>`)
  lines.push(`</p>`)

  if (meta.description) {
    lines.push(``)
    lines.push(`<p align="center">`)
    lines.push(`  <strong>${meta.description}</strong>`)
    lines.push(`</p>`)
  }

  const gh = meta.gitRemote ? parseGitHub(meta.gitRemote) : null
  const ghBadges = gh ? githubBadges(gh, meta.license) : []
  if (ghBadges.length > 0) {
    lines.push(``)
    lines.push(`<p align="center">`)
    lines.push(`  ${ghBadges.join('\n  ')}`)
    lines.push(`</p>`)
  }

  const sBadges = stackBadges(meta.stacks)
  if (sBadges.length > 0) {
    lines.push(``)
    lines.push(`<p align="center">`)
    lines.push(`  ${sBadges.join('\n  ')}`)
    lines.push(`</p>`)
  }

  return lines.join('\n')
}

export function sectionOverview(meta: ProjectMetadata): string {
  if (!meta.description) return ''
  return `## Overview\n\n${meta.description}`
}

export function sectionStack(meta: ProjectMetadata): string {
  if (meta.stacks.length === 0) return ''
  const items = meta.stacks.map(s => `- ${s}`).join('\n')
  return `## Tech Stack\n\n${items}`
}

export function sectionRequirements(meta: ProjectMetadata): string {
  const lines: string[] = []

  if (meta.engines) {
    for (const [tool, range] of Object.entries(meta.engines)) {
      lines.push(`- ${tool} \`${range}\``)
    }
  } else if (meta.stacks.includes('Node.js')) {
    lines.push('- Node.js 18+')
  }

  if (meta.packageManager === 'pnpm') lines.push('- pnpm')
  else if (meta.packageManager === 'yarn') lines.push('- yarn')
  else if (meta.packageManager === 'bun') lines.push('- bun')

  if (meta.hasDocker) lines.push('- Docker')

  if (lines.length === 0) return ''
  return `## Requirements\n\n${lines.join('\n')}`
}

export function sectionInstall(meta: ProjectMetadata): string {
  if (!meta.packageManager) return ''
  let cmd = ''
  if (meta.packageManager === 'npm') cmd = 'npm install'
  else if (meta.packageManager === 'pnpm') cmd = 'pnpm install'
  else if (meta.packageManager === 'yarn') cmd = 'yarn'
  else if (meta.packageManager === 'bun') cmd = 'bun install'
  else if (meta.packageManager === 'poetry') cmd = 'poetry install'
  else if (meta.packageManager === 'uv') cmd = 'uv sync'
  if (!cmd) return ''
  return `## Installation\n\n\`\`\`bash\n${cmd}\n\`\`\``
}

export function sectionUsage(meta: ProjectMetadata): string {
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm
  const line = meta.scripts['dev']
    ? `${run} dev`
    : meta.scripts['start']
      ? `${run} start`
      : null
  if (!line) return ''
  return `## Usage\n\n\`\`\`bash\n${line}\n\`\`\``
}

export function sectionCommands(meta: ProjectMetadata): string {
  if (Object.keys(meta.scripts).length === 0) return ''
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm

  const rows = Object.entries(meta.scripts)
    .map(([name, cmd]) => `| \`${run} ${name}\` | \`${cmd}\` |`)
    .join('\n')
  return `## Commands\n\n| Command | Script |\n| --- | --- |\n${rows}`
}

export function sectionTesting(meta: ProjectMetadata): string {
  if (!meta.scripts['test']) return ''
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm
  return `## Testing\n\n\`\`\`bash\n${run} test\n\`\`\``
}

export function sectionBuild(meta: ProjectMetadata): string {
  if (!meta.scripts['build']) return ''
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm
  return `## Build\n\n\`\`\`bash\n${run} build\n\`\`\``
}

export function sectionProjectStructure(meta: ProjectMetadata): string {
  if (meta.topLevelDirs.length === 0) return ''
  const lines = meta.topLevelDirs.map(d => `├─ ${d}/`)
  return `## Project Structure\n\n\`\`\`\n${lines.join('\n')}\n\`\`\``
}

export function sectionEnvVars(meta: ProjectMetadata): string {
  if (meta.envVars.length === 0) return ''
  const rows = meta.envVars.map(v => `| \`${v}\` | |`).join('\n')
  return `## Environment Variables\n\nCopy \`.env.example\` to \`.env\` and fill in the values.\n\n| Variable | Description |\n| --- | --- |\n${rows}`
}

export function sectionDocker(meta: ProjectMetadata): string {
  if (!meta.hasDocker) return ''
  const lines = ['```bash', 'docker build -t app .']
  if (meta.hasDockerCompose) lines.push('docker compose up')
  lines.push('```')
  return `## Docker\n\n${lines.join('\n')}`
}

export function sectionContributing(meta: ProjectMetadata): string {
  const branch = meta.gitBranch ?? 'main'
  return [
    '## Contributing',
    '',
    '1. Fork the repository',
    '2. Create a branch: `git checkout -b feature/your-feature`',
    '3. Commit your changes',
    `4. Push to the branch: \`git push origin feature/your-feature\``,
    `5. Open a pull request against \`${branch}\``,
  ].join('\n')
}

export function sectionLicense(meta: ProjectMetadata): string {
  if (!meta.license) return ''
  return `## License\n\n[${meta.license}](LICENSE)`
}

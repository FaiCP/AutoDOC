import type { ProjectMetadata } from '../types.js'

export function sectionStack(meta: ProjectMetadata): string {
  if (meta.stacks.length === 0) return ''
  const items = meta.stacks.map(s => `- ${s}`).join('\n')
  return `## Tech Stack\n\n${items}`
}

export function sectionInstall(meta: ProjectMetadata): string {
  if (!meta.packageManager) return ''
  const cmds: string[] = []
  if (meta.packageManager === 'npm') cmds.push('npm install')
  else if (meta.packageManager === 'pnpm') cmds.push('pnpm install')
  else if (meta.packageManager === 'yarn') cmds.push('yarn')
  else if (meta.packageManager === 'bun') cmds.push('bun install')
  else if (meta.packageManager === 'poetry') cmds.push('poetry install')
  else if (meta.packageManager === 'uv') cmds.push('uv sync')
  if (cmds.length === 0) return ''
  return `## Installation\n\n\`\`\`bash\n${cmds.join('\n')}\n\`\`\``
}

export function sectionUsage(meta: ProjectMetadata): string {
  const lines: string[] = []
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm

  if (meta.scripts['dev']) lines.push(`${run} dev`)
  else if (meta.scripts['start']) lines.push(`${run} start`)

  if (lines.length === 0) return ''
  return `## Usage\n\n\`\`\`bash\n${lines.join('\n')}\n\`\`\``
}

export function sectionCommands(meta: ProjectMetadata): string {
  if (Object.keys(meta.scripts).length === 0) return ''
  const pm = meta.packageManager ?? 'npm'
  const run = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm

  const rows = Object.entries(meta.scripts)
    .map(([name, cmd]) => `| \`${run} ${name}\` | \`${cmd}\` |`)
    .join('\n')
  return `## Commands\n\n| Command | Description |\n| --- | --- |\n${rows}`
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

export function sectionLicense(meta: ProjectMetadata): string {
  if (!meta.license) return ''
  const remote = meta.gitRemote?.replace(/\.git$/, '')
  const link = remote ? `[${meta.license}](LICENSE)` : meta.license
  return `## License\n\n${link}`
}

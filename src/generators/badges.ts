import type { ProjectMetadata } from '../types.js'

export interface GitHubCoords {
  owner: string
  repo: string
}

export function parseGitHub(remote: string): GitHubCoords | null {
  const m = remote.match(/github\.com[:/]([^/]+)\/([^/.]+?)(\.git)?$/)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

function staticBadge(label: string, color: string, logo: string): string {
  return `https://img.shields.io/badge/${encodeURIComponent(label)}-${color}?logo=${logo}&logoColor=white`
}

function badge(url: string, alt: string, href?: string): string {
  const img = `<img src="${url}" alt="${alt}" />`
  return href ? `<a href="${href}">${img}</a>` : img
}

export function githubBadges(gh: GitHubCoords, license?: string): string[] {
  const base = `https://github.com/${gh.owner}/${gh.repo}`
  const badges: string[] = [
    badge(
      `https://img.shields.io/github/stars/${gh.owner}/${gh.repo}?style=flat&color=yellow`,
      'Stars',
      `${base}/stargazers`,
    ),
    badge(
      `https://img.shields.io/github/last-commit/${gh.owner}/${gh.repo}?style=flat`,
      'Last Commit',
      `${base}/commits`,
    ),
  ]
  if (license) {
    badges.push(badge(
      `https://img.shields.io/github/license/${gh.owner}/${gh.repo}?style=flat`,
      'License',
      `${base}/blob/main/LICENSE`,
    ))
  }
  return badges
}

const STACK_BADGE: Record<string, { color: string; logo: string }> = {
  'React':        { color: '61DAFB', logo: 'react' },
  'Next.js':      { color: '000000', logo: 'next.js' },
  'Vue':          { color: '4FC08D', logo: 'vue.js' },
  'Nuxt':         { color: '00DC82', logo: 'nuxt.js' },
  'Angular':      { color: 'DD0031', logo: 'angular' },
  'Svelte':       { color: 'FF3E00', logo: 'svelte' },
  'TypeScript':   { color: '3178C6', logo: 'typescript' },
  'Tailwind CSS': { color: '06B6D4', logo: 'tailwindcss' },
  'Vite':         { color: '646CFF', logo: 'vite' },
  'Node.js':      { color: '339933', logo: 'node.js' },
  'Express':      { color: '404040', logo: 'express' },
  'Fastify':      { color: '404040', logo: 'fastify' },
  'NestJS':       { color: 'E0234E', logo: 'nestjs' },
  'Electron':     { color: '47848F', logo: 'electron' },
  'Python':       { color: '3776AB', logo: 'python' },
  'Go':           { color: '00ADD8', logo: 'go' },
  'Rust':         { color: 'CE422B', logo: 'rust' },
  'Java':         { color: 'ED8B00', logo: 'openjdk' },
  '.NET':         { color: '512BD4', logo: 'dotnet' },
  'PHP':          { color: '777BB4', logo: 'php' },
}

// Framework-first priority — more specific wins
const EMOJI_PRIORITY = [
  'Next.js', 'Nuxt', 'Angular', 'Svelte',
  'React', 'Vue',
  'NestJS', 'Electron', 'Express', 'Fastify',
  'Python', 'Go', 'Rust', 'Java', '.NET', 'PHP',
  'Node.js',
]

const STACK_EMOJI: Record<string, string> = {
  'React':    '⚛️',
  'Next.js':  '▲',
  'Vue':      '💚',
  'Nuxt':     '💚',
  'Angular':  '🔴',
  'Svelte':   '🧡',
  'NestJS':   '🐈',
  'Electron': '🖥️',
  'Python':   '🐍',
  'Go':       '🐹',
  'Rust':     '🦀',
  'Java':     '☕',
  '.NET':     '💜',
  'PHP':      '🐘',
  'Node.js':  '🟢',
}

export function stackEmoji(stacks: string[]): string {
  const set = new Set(stacks)
  for (const s of EMOJI_PRIORITY) {
    if (set.has(s) && STACK_EMOJI[s]) return STACK_EMOJI[s]
  }
  return '📦'
}

export function stackBadges(stacks: string[]): string[] {
  return stacks
    .filter(s => STACK_BADGE[s])
    .map(s => {
      const b = STACK_BADGE[s]
      return `<img src="${staticBadge(s, b.color, b.logo)}" alt="${s}" />`
    })
}

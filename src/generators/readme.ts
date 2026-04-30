import type { ProjectMetadata } from '../types.js'
import {
  sectionHeader,
  sectionOverview,
  sectionStack,
  sectionRequirements,
  sectionInstall,
  sectionUsage,
  sectionCommands,
  sectionTesting,
  sectionBuild,
  sectionProjectStructure,
  sectionEnvVars,
  sectionDocker,
  sectionContributing,
  sectionLicense,
} from './sections.js'

const MARKER_START = '<!-- AUTOREADME:START -->'
const MARKER_END = '<!-- AUTOREADME:END -->'

export function generateBlock(meta: ProjectMetadata): string {
  const sections = [
    sectionHeader(meta),
    sectionOverview(meta),
    sectionStack(meta),
    sectionRequirements(meta),
    sectionInstall(meta),
    sectionUsage(meta),
    sectionCommands(meta),
    sectionTesting(meta),
    sectionBuild(meta),
    sectionProjectStructure(meta),
    sectionEnvVars(meta),
    sectionDocker(meta),
    sectionContributing(meta),
    sectionLicense(meta),
  ].filter(Boolean)

  return sections.join('\n\n')
}

export function applyToReadme(
  existing: string | null,
  block: string,
  force: boolean,
): string {
  const wrapped = `${MARKER_START}\n${block}\n${MARKER_END}`

  if (!existing) return wrapped + '\n'

  if (existing.includes(MARKER_START) && existing.includes(MARKER_END)) {
    const start = existing.indexOf(MARKER_START)
    const end = existing.indexOf(MARKER_END) + MARKER_END.length
    return existing.slice(0, start) + wrapped + existing.slice(end)
  }

  if (force) return wrapped + '\n'

  return wrapped + '\n\n' + existing
}

export function hasMarkers(content: string): boolean {
  return content.includes(MARKER_START) && content.includes(MARKER_END)
}

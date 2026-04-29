export interface ProjectMetadata {
  name: string
  description: string
  version?: string
  license?: string
  gitRemote?: string
  gitBranch?: string
  stacks: string[]
  packageManager?: string
  engines?: Record<string, string>
  scripts: Record<string, string>
  envVars: string[]
  hasDocker: boolean
  hasDockerCompose: boolean
  topLevelDirs: string[]
}

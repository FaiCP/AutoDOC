param(
    [string]$ProjectPath = (Join-Path $PSScriptRoot ".."),
    [switch]$FailOnWarnings
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $ProjectPath -PathType Container)) {
    throw "Project path not found: $ProjectPath"
}

$root = (Resolve-Path -Path $ProjectPath).Path

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-File {
    param([string]$RelativePath)
    return Test-Path -Path (Join-Path $root $RelativePath) -PathType Leaf
}

function Get-GitValue {
    param([string[]]$Arguments)

    if (-not (Test-Command "git")) {
        return $null
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $value = & git -C $root @Arguments 2>$null
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    if ($exitCode -ne 0 -or [string]::IsNullOrWhiteSpace($value)) {
        return $null
    }

    return ($value -join "`n").Trim()
}

$checks = [ordered]@{
    projectRoot = $root
    hasGit = Test-Command "git"
    isGitRepository = Test-Path -Path (Join-Path $root ".git") -PathType Container
    currentBranch = Get-GitValue -Arguments @("branch", "--show-current")
    originRemote = Get-GitValue -Arguments @("config", "--get", "remote.origin.url")
    hasDocsWorkflow = Test-File ".github/workflows/docs.yml"
    hasMkDocsConfig = Test-File "mkdocs.yml"
    hasReadme = Test-File "README.md"
    hasDocsIndex = Test-File "docs/index.md"
    hasLycheeConfig = Test-File "lychee.toml"
    hasMarkdownlintConfig = Test-File ".markdownlint.json"
    hasMkDocs = Test-Command "mkdocs"
    hasMarkdownlint = Test-Command "markdownlint"
}

$warnings = @()

if (-not $checks.hasGit) {
    $warnings += "Git is not installed or not available in PATH."
}

if (-not $checks.isGitRepository) {
    $warnings += "Project is not initialized as a Git repository."
}

if ([string]::IsNullOrWhiteSpace($checks.originRemote)) {
    $warnings += "Git remote 'origin' is not configured."
}

if ($checks.currentBranch -ne "main") {
    $warnings += "Current branch is not 'main'. GitHub Pages deploy runs only from main."
}

foreach ($requiredFile in @(
    "hasDocsWorkflow",
    "hasMkDocsConfig",
    "hasReadme",
    "hasDocsIndex",
    "hasLycheeConfig",
    "hasMarkdownlintConfig"
)) {
    if (-not $checks[$requiredFile]) {
        $warnings += "Missing required file check: $requiredFile."
    }
}

if (-not $checks.hasMkDocs) {
    $warnings += "mkdocs is not installed locally. GitHub Actions installs it during CI."
}

if (-not $checks.hasMarkdownlint) {
    $warnings += "markdownlint is not installed locally. GitHub Actions installs it during CI."
}

$result = [ordered]@{
    checks = $checks
    warnings = $warnings
    ready = $warnings.Count -eq 0
}

$result | ConvertTo-Json -Depth 5

if ($FailOnWarnings -and $warnings.Count -gt 0) {
    exit 1
}

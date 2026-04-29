param(
    [string]$ProjectName = "Auto Docs Template",
    [string]$Description = "Automated documentation system for GitHub repositories",
    [string]$ProjectPath = (Join-Path $PSScriptRoot ".."),
    [switch]$CheckPrerequisites,
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Test-Prerequisites {
    $requiredCommands = @("git", "mkdocs", "markdownlint")
    $missing = @()

    foreach ($command in $requiredCommands) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            $missing += $command
        }
    }

    if ($missing.Count -gt 0) {
        throw "Missing local documentation prerequisites: $($missing -join ', '). Install them before running local validation."
    }
}

if ($CheckPrerequisites) {
    Test-Prerequisites
}

if (-not (Test-Path -Path $ProjectPath -PathType Container)) {
    throw "Project path not found: $ProjectPath"
}

$templateRoot = (Resolve-Path -Path (Join-Path $PSScriptRoot "..")).Path
$root = (Resolve-Path -Path $ProjectPath).Path
$docsPath = Join-Path $root "docs"
$readmePath = Join-Path $root "README.md"
$indexPath = Join-Path $docsPath "index.md"
$mkdocsPath = Join-Path $root "mkdocs.yml"
$templatePath = Join-Path $PSScriptRoot "README.template.md"
$detectionPath = Join-Path $docsPath "project-detection.json"
$isTemplateProject = $root -eq $templateRoot
$createdFiles = @{}

function Write-Action {
    param([string]$Message)
    Write-Host $Message
}

function Ensure-Directory {
    param([string]$Path)

    if (Test-Path -Path $Path -PathType Container) {
        return
    }

    if ($DryRun) {
        Write-Action "[dry-run] Create directory: $Path"
        return
    }

    New-Item -ItemType Directory -Force -Path $Path | Out-Null
    Write-Action "Created directory: $Path"
}

function Test-CanWriteFile {
    param([string]$Path)

    if (-not (Test-Path -Path $Path -PathType Leaf)) {
        return $true
    }

    $fullPath = (Resolve-Path -Path $Path).Path
    if ($createdFiles.ContainsKey($fullPath)) {
        return $true
    }

    if ($Force -or $isTemplateProject) {
        return $true
    }

    Write-Action "Skipped existing file without -Force: $Path"
    return $false
}

function Set-GeneratedContent {
    param(
        [string]$Path,
        [string]$Value
    )

    Ensure-Directory -Path (Split-Path -Parent $Path)

    if (-not (Test-CanWriteFile -Path $Path)) {
        return
    }

    if ($DryRun) {
        if (Test-Path -Path $Path -PathType Leaf) {
            Write-Action "[dry-run] Update file: $Path"
        }
        else {
            Write-Action "[dry-run] Create file: $Path"
        }
        return
    }

    Set-Content -Path $Path -Value $Value -Encoding UTF8
    $createdFiles[(Resolve-Path -Path $Path).Path] = $true
    Write-Action "Wrote file: $Path"
}

function Copy-TemplateFile {
    param([string]$RelativePath)

    $source = Join-Path $templateRoot $RelativePath
    $destination = Join-Path $root $RelativePath

    if (-not (Test-Path -Path $source -PathType Leaf)) {
        throw "Template file not found: $source"
    }

    if ((Resolve-Path -Path $source).Path -eq $destination) {
        return
    }

    Ensure-Directory -Path (Split-Path -Parent $destination)

    if (-not (Test-CanWriteFile -Path $destination)) {
        return
    }

    if ($DryRun) {
        if (Test-Path -Path $destination -PathType Leaf) {
            Write-Action "[dry-run] Update template file: $destination"
        }
        else {
            Write-Action "[dry-run] Copy template file: $destination"
        }
        return
    }

    Copy-Item -Path $source -Destination $destination -Force
    $createdFiles[(Resolve-Path -Path $destination).Path] = $true
    Write-Action "Copied template file: $destination"
}

function Install-TemplateFiles {
    $files = @(
        ".gitignore",
        ".markdownlint.json",
        "lychee.toml",
        "Makefile",
        "mkdocs.yml",
        ".github/workflows/docs.yml",
        ".github/workflows/README.md",
        "scripts/check-github-readiness.ps1",
        "scripts/detect-project.ps1",
        "scripts/generate-docs.ps1",
        "scripts/README.template.md",
        "docs/api.md",
        "docs/architecture.md",
        "docs/configuration.md",
        "docs/contributing.md",
        "docs/deployment.md",
        "docs/getting-started.md"
    )

    foreach ($file in $files) {
        Copy-TemplateFile -RelativePath $file
    }
}

Ensure-Directory -Path $docsPath
Install-TemplateFiles

if (Test-Path $templatePath) {
    $readme = Get-Content -Raw -Path $templatePath
    $readme = $readme.Replace("{{PROJECT_NAME}}", $ProjectName)
    $readme = $readme.Replace("{{DESCRIPTION}}", $Description)
}
else {
    throw "README template not found: $templatePath"
}

$detection = & (Join-Path $PSScriptRoot "detect-project.ps1") -Path $root
Set-GeneratedContent -Path $detectionPath -Value $detection
$metadata = $detection | ConvertFrom-Json

function Join-DetectedValues {
    param($Values)

    if ($null -eq $Values) {
        return "none"
    }

    $items = @($Values) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    if ($items.Count -eq 0) {
        return "none"
    }

    return $items -join ", "
}

$detectedStacks = Join-DetectedValues -Values $metadata.stacks
$detectedPackageManagers = Join-DetectedValues -Values $metadata.packageManagers
$detectedDocGenerators = Join-DetectedValues -Values $metadata.docGenerators
$detectedGitRemote = if ([string]::IsNullOrWhiteSpace($metadata.gitRemote)) { "not configured" } else { $metadata.gitRemote }

$readme = $readme.Replace("{{DETECTED_STACKS}}", $detectedStacks)
$readme = $readme.Replace("{{DETECTED_PACKAGE_MANAGERS}}", $detectedPackageManagers)
$readme = $readme.Replace("{{DETECTED_DOC_GENERATORS}}", $detectedDocGenerators)
$readme = $readme.Replace("{{GIT_REMOTE}}", $detectedGitRemote)

function ConvertTo-GitHubUrl {
    param([string]$Remote)

    if ([string]::IsNullOrWhiteSpace($Remote)) {
        return $null
    }

    if ($Remote -match '^git@github\.com:(?<repo>.+?)(\.git)?$') {
        return "https://github.com/$($Matches.repo)"
    }

    if ($Remote -match '^(?<url>https://github\.com/.+?)(\.git)?$') {
        return $Matches.url
    }

    return $Remote
}

function Update-MkDocsConfig {
    param(
        [string]$Path,
        [string]$GitRemote,
        [string]$Name,
        [string]$Summary
    )

    if (-not (Test-Path -Path $Path -PathType Leaf)) {
        return
    }

    $repoUrl = ConvertTo-GitHubUrl -Remote $GitRemote
    $content = Get-Content -Raw -Path $Path

    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        $replacement = "# repo_url: configure after connecting a GitHub remote"
    }
    else {
        $replacement = "repo_url: $repoUrl"
    }

    if ($content -match '(?m)^#?\s*repo_url:\s*.*$') {
        $content = $content -replace '(?m)^#?\s*repo_url:\s*.*$', $replacement
    }
    else {
        $content = $content.TrimEnd() + "`n$replacement`n"
    }

    if ($content -match '(?m)^site_name:\s*.*$') {
        $content = $content -replace '(?m)^site_name:\s*.*$', "site_name: $Name"
    }

    if ($content -match '(?m)^site_description:\s*.*$') {
        $content = $content -replace '(?m)^site_description:\s*.*$', "site_description: $Summary"
    }

    Set-GeneratedContent -Path $Path -Value ($content.TrimEnd() + "`n")
}

$indexTemplate = @'
# $ProjectName

$Description.

## System

The documentation system keeps the README and technical docs aligned with the repository on every commit.

## Project Detection

The latest detected project metadata is written to `docs/project-detection.json`.

| Field | Value |
| --- | --- |
| Stacks | $DetectedStacks |
| Package managers | $DetectedPackageManagers |
| Documentation generators | $DetectedDocGenerators |
| Git remote | $DetectedGitRemote |

## Flow

```text
commit
-> GitHub Actions
-> generate docs
-> validate docs
-> publish docs
```
'@

$index = $indexTemplate.Replace('$ProjectName', $ProjectName)
$index = $index.Replace('$Description', $Description)
$index = $index.Replace('$DetectedStacks', $detectedStacks)
$index = $index.Replace('$DetectedPackageManagers', $detectedPackageManagers)
$index = $index.Replace('$DetectedDocGenerators', $detectedDocGenerators)
$index = $index.Replace('$DetectedGitRemote', $detectedGitRemote)

Set-GeneratedContent -Path $readmePath -Value $readme
Set-GeneratedContent -Path $indexPath -Value $index
Update-MkDocsConfig -Path $mkdocsPath -GitRemote $metadata.gitRemote -Name $ProjectName -Summary $Description

if ($DryRun) {
    Write-Host "Dry run completed for $root."
}
else {
    Write-Host "Documentation generated successfully for $root."
}

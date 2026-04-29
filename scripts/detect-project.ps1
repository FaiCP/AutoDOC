param(
    [string]$Path = "."
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $Path -PathType Container)) {
    throw "Project path not found: $Path"
}

$root = (Resolve-Path -Path $Path).Path

function Test-RepoFile {
    param([string]$Name)
    return Test-Path (Join-Path $root $Name)
}

function Get-GitRemote {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        return $null
    }

    $remote = git -C $root config --get remote.origin.url 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remote)) {
        return $null
    }

    return $remote.Trim()
}

$detected = [ordered]@{
    root = $root
    gitRemote = Get-GitRemote
    stacks = @()
    packageManagers = @()
    docGenerators = @()
}

if (Test-RepoFile "package.json") {
    $detected.stacks += "node"
    $detected.docGenerators += "typedoc"
}

if ((Test-RepoFile "pyproject.toml") -or (Test-RepoFile "requirements.txt") -or (Test-RepoFile "setup.py")) {
    $detected.stacks += "python"
    $detected.docGenerators += "pdoc"
}

if (Test-RepoFile "go.mod") {
    $detected.stacks += "go"
    $detected.docGenerators += "godoc"
}

if (Test-RepoFile "Cargo.toml") {
    $detected.stacks += "rust"
    $detected.docGenerators += "cargo doc"
}

if ((Test-RepoFile "pom.xml") -or (Test-RepoFile "build.gradle") -or (Test-RepoFile "build.gradle.kts")) {
    $detected.stacks += "java"
    $detected.docGenerators += "javadoc"
}

if ((Test-RepoFile "*.sln") -or (Get-ChildItem -Path $root -Filter "*.csproj" -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    $detected.stacks += "dotnet"
    $detected.docGenerators += "docfx"
}

if (Test-RepoFile "pnpm-lock.yaml") {
    $detected.packageManagers += "pnpm"
}

if (Test-RepoFile "yarn.lock") {
    $detected.packageManagers += "yarn"
}

if (Test-RepoFile "package-lock.json") {
    $detected.packageManagers += "npm"
}

if (Test-RepoFile "poetry.lock") {
    $detected.packageManagers += "poetry"
}

if (Test-RepoFile "uv.lock") {
    $detected.packageManagers += "uv"
}

if ($detected.stacks.Count -eq 0) {
    $detected.stacks += "generic"
}

if ($detected.packageManagers.Count -eq 0) {
    $detected.packageManagers += "none"
}

$detected | ConvertTo-Json -Depth 5

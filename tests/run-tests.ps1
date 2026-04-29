param(
    [switch]$KeepTemp
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -Path (Join-Path $PSScriptRoot "..")).Path
$detectScript = Join-Path $repoRoot "scripts/detect-project.ps1"
$generateScript = Join-Path $repoRoot "scripts/generate-docs.ps1"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("auto-docs-tests-" + [System.Guid]::NewGuid().ToString("N"))
$failures = @()

function New-TestProject {
    param(
        [string]$Name,
        [hashtable]$Files
    )

    $path = Join-Path $tempRoot $Name
    New-Item -ItemType Directory -Force -Path $path | Out-Null

    foreach ($relativePath in $Files.Keys) {
        $target = Join-Path $path $relativePath
        $parent = Split-Path -Parent $target
        if (-not (Test-Path -Path $parent -PathType Container)) {
            New-Item -ItemType Directory -Force -Path $parent | Out-Null
        }
        Set-Content -Path $target -Value $Files[$relativePath] -Encoding UTF8
    }

    return $path
}

function Assert-Contains {
    param(
        [string]$Label,
        $Values,
        [string]$Expected
    )

    if (@($Values) -notcontains $Expected) {
        $script:failures += "$Label expected '$Expected' but got '$(@($Values) -join ', ')'."
    }
}

function Assert-NotExists {
    param(
        [string]$Label,
        [string]$Path
    )

    if (Test-Path -Path $Path) {
        $script:failures += "$Label expected path to be absent: $Path"
    }
}

function Test-Detection {
    param(
        [string]$Name,
        [hashtable]$Files,
        [string]$ExpectedStack,
        [string]$ExpectedPackageManager,
        [string]$ExpectedDocGenerator = "",
        [string[]]$ExpectedStacks = @()
    )

    $project = New-TestProject -Name $Name -Files $Files
    $result = & $detectScript -Path $project | ConvertFrom-Json

    Assert-Contains -Label "$Name stack" -Values $result.stacks -Expected $ExpectedStack
    Assert-Contains -Label "$Name package manager" -Values $result.packageManagers -Expected $ExpectedPackageManager
    if (-not [string]::IsNullOrEmpty($ExpectedDocGenerator)) {
        Assert-Contains -Label "$Name doc generator" -Values $result.docGenerators -Expected $ExpectedDocGenerator
    }
    foreach ($s in $ExpectedStacks) {
        Assert-Contains -Label "$Name extra stack" -Values $result.stacks -Expected $s
    }
}

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

try {
    Test-Detection -Name "node-npm" -Files @{
        "package.json" = "{}"
        "package-lock.json" = "{}"
    } -ExpectedStack "node" -ExpectedPackageManager "npm"

    Test-Detection -Name "node-typedoc" -Files @{
        "package.json" = '{"devDependencies":{"typedoc":"^0.25.0"}}'
        "package-lock.json" = "{}"
    } -ExpectedStack "node" -ExpectedPackageManager "npm" -ExpectedDocGenerator "typedoc"

    Test-Detection -Name "react-typescript-vite" -Files @{
        "package.json" = '{"dependencies":{"react":"^19.0.0"},"devDependencies":{"typescript":"^5.0.0","vite":"^5.0.0","tailwindcss":"^4.0.0"}}'
        "package-lock.json" = "{}"
    } -ExpectedStack "node" -ExpectedPackageManager "npm" -ExpectedStacks @("react","typescript","vite","tailwindcss")

    Test-Detection -Name "python-poetry" -Files @{
        "pyproject.toml" = "[project]`nname = 'sample'"
        "poetry.lock" = ""
    } -ExpectedStack "python" -ExpectedPackageManager "poetry" -ExpectedDocGenerator "pdoc"

    Test-Detection -Name "dotnet" -Files @{
        "Sample/Sample.csproj" = "<Project Sdk=`"Microsoft.NET.Sdk`"></Project>"
    } -ExpectedStack "dotnet" -ExpectedPackageManager "none" -ExpectedDocGenerator "docfx"

    Test-Detection -Name "java" -Files @{
        "pom.xml" = "<project></project>"
    } -ExpectedStack "java" -ExpectedPackageManager "none" -ExpectedDocGenerator "javadoc"

    Test-Detection -Name "go" -Files @{
        "go.mod" = "module example.com/sample"
    } -ExpectedStack "go" -ExpectedPackageManager "none" -ExpectedDocGenerator "godoc"

    Test-Detection -Name "rust" -Files @{
        "Cargo.toml" = "[package]`nname = 'sample'"
    } -ExpectedStack "rust" -ExpectedPackageManager "none" -ExpectedDocGenerator "cargo doc"

    $dryRunProject = New-TestProject -Name "dry-run" -Files @{}
    & $generateScript -ProjectPath $dryRunProject -ProjectName "Dry Run" -Description "Dry run test" -DryRun | Out-Null
    Assert-NotExists -Label "DryRun README" -Path (Join-Path $dryRunProject "README.md")
    Assert-NotExists -Label "DryRun docs" -Path (Join-Path $dryRunProject "docs")

    if ($failures.Count -gt 0) {
        $failures | ForEach-Object { Write-Error $_ }
        exit 1
    }

    Write-Host "All tests passed."
}
finally {
    if (-not $KeepTemp -and (Test-Path -Path $tempRoot)) {
        Remove-Item -Path $tempRoot -Recurse -Force
    }
    elseif ($KeepTemp) {
        Write-Host "Kept temp test directory: $tempRoot"
    }
}

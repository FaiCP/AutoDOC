# Getting Started

## Requirements

- GitHub repository.
- GitHub Actions enabled.
- GitHub Pages configured with GitHub Actions as the source.
- Python and MkDocs Material when building locally.

## Local Preview

```powershell
pip install mkdocs-material
mkdocs serve
```

## Generate Documentation

Regenerate documentation in the current repository:

```powershell
./scripts/generate-docs.ps1
```

Generate documentation in another repository:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -ProjectName "My Project" -Description "Project description"
```

Preview the install without writing files:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -DryRun
```

Overwrite existing files intentionally:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -Force
```

Check local tools before running a full validation:

```powershell
./scripts/generate-docs.ps1 -CheckPrerequisites
```

## Production

Push to `main`. The GitHub Actions workflow builds and publishes the documentation automatically.

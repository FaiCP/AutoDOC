# {{PROJECT_NAME}}

[![Docs](https://img.shields.io/badge/docs-automated-0f766e)](#)
[![GitHub Actions](https://img.shields.io/badge/github%20actions-ready-2563eb)](#)
[![License](https://img.shields.io/badge/license-MIT-111827)](#)

{{DESCRIPTION}}.

## Overview

This repository uses automated documentation. The root README is the professional entry point, while the `docs/` directory contains the complete technical documentation.

## Project Metadata

| Field | Value |
| --- | --- |
| Stacks | {{DETECTED_STACKS}} |
| Package managers | {{DETECTED_PACKAGE_MANAGERS}} |
| Documentation generators | {{DETECTED_DOC_GENERATORS}} |
| Git remote | {{GIT_REMOTE}} |

## Quick Start

```powershell
./scripts/generate-docs.ps1
```

Generate documentation for another repository:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -ProjectName "My Project" -Description "Project description"
```

Preview changes before writing files:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -DryRun
```

Overwrite existing generated/template files:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -Force
```

Check local documentation prerequisites:

```powershell
./scripts/generate-docs.ps1 -CheckPrerequisites
```

Check whether the repository is ready for GitHub Actions and Pages:

```powershell
./scripts/check-github-readiness.ps1
```

## Documentation

Documentation is generated automatically on every commit and published from GitHub Actions when changes reach `main`.

## Commands

| Command | Purpose |
| --- | --- |
| `./scripts/generate-docs.ps1` | Regenerate documentation files |
| `./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo"` | Generate docs in another repository |
| `./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -DryRun` | Preview files that would be created or updated |
| `./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -Force` | Overwrite existing generated/template files |
| `./scripts/generate-docs.ps1 -CheckPrerequisites` | Verify local docs tools |
| `./scripts/check-github-readiness.ps1` | Check Git, GitHub Actions and Pages readiness |
| `mkdocs serve` | Preview docs locally |
| `mkdocs build --strict` | Build docs for production |

## License

MIT

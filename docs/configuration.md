# Configuration

## Repository Settings

Enable GitHub Pages with GitHub Actions as the source.

## Workflow Permissions

The workflow needs these permissions:

- `contents: write` to commit generated documentation.
- `pages: write` to deploy GitHub Pages.
- `id-token: write` to publish with GitHub's Pages deployment flow.

## Project Metadata

Update these files before using the template in a real repository:

- `mkdocs.yml`
- `README.md`
- `scripts/README.template.md`
- `.github/workflows/docs.yml`

You can generate documentation in a target repository with:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -ProjectName "My Project" -Description "Project description"
```

Check whether the local validation tools are installed:

```powershell
./scripts/generate-docs.ps1 -CheckPrerequisites
```

Use `-DryRun` before applying the template to an existing repository:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -DryRun
```

Existing files are skipped by default when the target path is not this template repository. Use `-Force` only when you want the template to overwrite matching files:

```powershell
./scripts/generate-docs.ps1 -ProjectPath "C:\path\to\repo" -Force
```

## Generated Files

The generator writes:

- `README.md`
- `docs/index.md`
- `docs/project-detection.json`
- `docs/*.md` template pages when missing.
- `scripts/*.ps1` helper scripts when missing.
- `mkdocs.yml`, `Makefile`, `.markdownlint.json`, `lychee.toml` and `.github/workflows/docs.yml` when missing.

`docs/project-detection.json` includes the project root, detected stacks, package managers, documentation generators and Git remote when available.

## Tests

Run built-in tests without installing extra PowerShell modules:

```powershell
./tests/run-tests.ps1
```

The test runner creates temporary sample projects for Node, Python, .NET, Java, Go and Rust detection, then removes them when it finishes.

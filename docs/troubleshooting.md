# Troubleshooting

## PowerShell Script Execution Is Disabled

Run scripts with a process-scoped bypass:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-docs.ps1
```

This does not change the machine-wide execution policy.

## MkDocs Is Not Installed

Install MkDocs Material locally:

```powershell
pip install mkdocs-material
```

GitHub Actions installs it during CI.

## markdownlint Is Not Installed

Install the CLI locally:

```powershell
npm install -g markdownlint-cli
```

GitHub Actions installs it during CI.

## lychee Reports Broken Links

Review the failing URLs first. If a URL is intentionally ignored, add a scoped rule to `lychee.toml`.

## GitHub Pages Does Not Deploy

Check these repository settings:

- Actions are enabled.
- Pages source is GitHub Actions.
- Workflow permissions allow read and write.
- The deployment branch is `main`.

Then run:

```powershell
./scripts/check-github-readiness.ps1
```

## Git Reports Dubious Ownership

If a repository was created by a different local user, mark it as safe:

```powershell
git config --global --add safe.directory C:/path/to/repo
```

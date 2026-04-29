# Contributing

## Documentation Rules

- Keep the root `README.md` concise and professional.
- Put detailed technical content in `docs/`.
- Add new documentation pages to `mkdocs.yml`.
- Run the generator before opening a pull request.

## Local Checks

```powershell
./scripts/generate-docs.ps1
mkdocs build --strict
```

## Commit Style

Recommended prefixes:

- `docs:` for documentation-only changes.
- `feat:` for new behavior.
- `fix:` for bug fixes.
- `chore:` for maintenance.

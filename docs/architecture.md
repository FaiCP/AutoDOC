# Architecture

The documentation system has four core parts:

- `README.md`: public-facing project summary.
- `docs/`: complete technical documentation.
- `scripts/generate-docs.ps1`: central generation entry point.
- `.github/workflows/docs.yml`: automation pipeline.

## Responsibilities

The generator updates repository documentation. The workflow decides when to validate, commit and publish. MkDocs builds the static documentation site.

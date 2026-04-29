# GitHub Workflows

This folder contains the automation pipeline for documentation generation, validation, auto-commit and GitHub Pages deployment.

## Main Workflow

- `docs.yml`: runs on every push and pull request.
- Pull requests validate documentation without writing changes.
- Pushes to `main` generate documentation, commit generated changes and publish GitHub Pages.
- The workflow uses the `github-pages` environment and exposes the deployed page URL.
- `scripts/check-github-readiness.ps1` reports missing local or repository setup before deployment.

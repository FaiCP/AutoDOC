# Release Checklist

Use this checklist before publishing the template or applying it to an important repository.

## Local Checks

- Run `./tests/run-tests.ps1`.
- Run `./scripts/generate-docs.ps1`.
- Run `./scripts/check-github-readiness.ps1`.
- Run `mkdocs build --strict` when MkDocs is installed.
- Run `markdownlint "**/*.md"` when markdownlint is installed.

## Repository Checks

- Confirm the default branch is `main`.
- Confirm `origin` points to the expected GitHub repository.
- Confirm `.github/workflows/docs.yml` exists.
- Confirm GitHub Pages source is GitHub Actions.
- Confirm workflow permissions allow read and write.

## Content Checks

- Review `README.md`.
- Review `docs/index.md`.
- Review `docs/project-detection.json`.
- Replace placeholder examples with real repository values.
- Confirm generated metadata matches the project stack.

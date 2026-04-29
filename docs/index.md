# Auto Docs Template

Automated documentation system for GitHub repositories.

## System

The documentation system keeps the README and technical docs aligned with the repository on every commit.

## Project Detection

The latest detected project metadata is written to `docs/project-detection.json`.

| Field | Value |
| --- | --- |
| Stacks | generic |
| Package managers | none |
| Documentation generators | none |
| Git remote | not configured |

## Flow

```text
commit
-> GitHub Actions
-> generate docs
-> validate docs
-> publish docs
```

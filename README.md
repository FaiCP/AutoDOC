<!-- AUTOREADME:START -->
# autoreadme
CLI that detects your project and generates a professional README.md

## Tech Stack

- Node.js
- TypeScript

## Installation

```bash
npm install
```

## Usage

```bash
npm run dev
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | `tsc --watch` |
| `npm run test` | `node --test tests/**/*.test.js` |
| `npm run build` | `tsc` |
<!-- AUTOREADME:END -->

# autoreadme

CLI tool that detects your project stack and generates or updates a professional `README.md` automatically.

```bash
npx autoreadme generate
```

## Status

Work in progress. See [PLAN.md](PLAN.md) for roadmap.

## Goal

- Detect stack, package manager, scripts, license, git remote automatically
- Generate or update `README.md` with real project data
- Preserve manually written content using markers
- Run on any OS via npm
- Optional GitHub Actions workflow for auto-update on push

## Usage (planned)

```bash
npx autoreadme detect        # print detected project metadata
npx autoreadme generate      # create or update README.md
npx autoreadme generate --dry-run
npx autoreadme generate --force
npx autoreadme init --github-action
```

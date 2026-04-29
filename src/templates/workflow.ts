export const WORKFLOW = `name: Auto README

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  readme:
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Generate README
        run: npx autoreadme generate
      - name: Commit README
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "docs(readme): update generated README [skip ci]"
          file_pattern: README.md
`

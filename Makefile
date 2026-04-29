.PHONY: docs docs-build docs-serve

docs:
	pwsh ./scripts/generate-docs.ps1

docs-build:
	mkdocs build --strict

docs-serve:
	mkdocs serve

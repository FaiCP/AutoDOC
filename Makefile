.PHONY: docs docs-build docs-serve test

docs:
	pwsh ./scripts/generate-docs.ps1

docs-build:
	mkdocs build --strict

docs-serve:
	mkdocs serve

test:
	pwsh ./tests/run-tests.ps1

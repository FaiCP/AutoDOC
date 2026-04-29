# Stack Examples

The detector uses common project files to choose documentation hints.

## Node

Detected when `package.json` exists.

- Documentation generator: `typedoc`
- Package managers: `npm`, `pnpm` or `yarn` when lock files exist

## Python

Detected when `pyproject.toml`, `requirements.txt` or `setup.py` exists.

- Documentation generator: `pdoc`
- Package managers: `poetry` or `uv` when lock files exist

## .NET

Detected when a `.sln` or `.csproj` file exists.

- Documentation generator: `docfx`

## Java

Detected when `pom.xml`, `build.gradle` or `build.gradle.kts` exists.

- Documentation generator: `javadoc`

## Go

Detected when `go.mod` exists.

- Documentation generator: `godoc`

## Rust

Detected when `Cargo.toml` exists.

- Documentation generator: `cargo doc`

## Generic

Used when no supported stack marker is found.

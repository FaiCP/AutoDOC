# Plan de AutoReadme

## Estado actual

Proyecto activo: `C:\Users\luis\Desktop\Otros\DocumentacionGit`

Decision de producto al 2026-04-29:

- El alcance cambia de documentacion completa con MkDocs/GitHub Pages a una herramienta enfocada solo en `README.md`.
- El objetivo principal sera una CLI instalable con npm: `autoreadme`.
- La herramienta debe poder ejecutarse con `npx autoreadme generate` o instalarse globalmente con `npm install -g autoreadme`.
- Se descarta GitHub Pages como objetivo del producto.
- Se mantiene como opcion un workflow de GitHub Actions solo para auto-actualizar `README.md`.

## Objetivo

Crear una herramienta instalable por npm que detecte el proyecto actual y genere o actualice automaticamente un `README.md` profesional, preservando contenido manual cuando sea posible.

## Principios

- Solo generar y mantener `README.md`.
- No depender de MkDocs, Pages, markdownlint o lychee para el flujo principal.
- Funcionar en Windows, macOS y Linux.
- Ser ejecutable desde `npx`, instalacion global npm o scripts de CI.
- Proteger archivos existentes con `--dry-run`, `--force` y `--backup`.
- Usar marcadores para actualizar solo el bloque generado:

```markdown
<!-- AUTOREADME:START -->
contenido generado
<!-- AUTOREADME:END -->
```

## Fase 1 - Redefinir el producto

Estado: completada.

Entregables:

- Renombrar el enfoque de `Auto Docs` a `AutoReadme`.
- Definir comando principal `autoreadme`.
- Retirar del plan activo MkDocs, GitHub Pages, `docs/` como salida principal, `lychee` y validaciones de links.
- Mantener lo ya aprendido del detector actual como base tecnica.

## Fase 2 - Reestructurar como paquete npm

Estado: completada.

Estructura objetivo:

```text
autoreadme/
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ cli.ts
│  ├─ commands/
│  │  ├─ detect.ts
│  │  ├─ generate.ts
│  │  └─ init.ts
│  ├─ detectors/
│  ├─ generators/
│  ├─ templates/
│  └─ utils/
├─ tests/
├─ examples/
└─ README.md
```

Entregables:

- Crear `package.json` con `bin.autoreadme`.
- Crear build TypeScript.
- Crear entrada CLI.
- Migrar la logica PowerShell actual a Node/TypeScript.
- Dejar scripts PowerShell solo como compatibilidad temporal si hace falta.

## Fase 3 - Comandos de la CLI

Estado: pendiente.

Comandos objetivo:

```bash
autoreadme detect
autoreadme generate
autoreadme generate --dry-run
autoreadme generate --force
autoreadme generate --backup
autoreadme init --github-action
```

Uso esperado:

```bash
npx autoreadme generate
npm install -g autoreadme
autoreadme generate
```

Entregables:

- `detect`: imprime metadata del proyecto.
- `generate`: crea o actualiza `README.md`.
- `init --github-action`: instala workflow opcional para auto-actualizar README.
- Ayuda CLI clara con `--help`.

## Fase 4 - Detector de proyectos

Estado: pendiente.

Detectar:

- Nombre del proyecto.
- Descripcion cuando exista.
- Stack: Node, React, Vue, Angular, Next, Nuxt, Svelte, TypeScript, Tailwind, Vite, Python, .NET, Java, Go, Rust, PHP.
- Package manager: npm, pnpm, yarn, bun, poetry, uv.
- Scripts disponibles: install, dev, start, test, build, lint.
- Licencia.
- Remoto Git.
- Rama actual.
- Variables de entorno desde `.env.example`.
- Dockerfile y docker-compose si existen.

Archivos a analizar:

- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `.sln`, `.csproj`
- `pom.xml`, `build.gradle`, `build.gradle.kts`
- `go.mod`
- `Cargo.toml`
- `composer.json`
- `.env.example`
- `Dockerfile`
- `LICENSE`
- `.git/config`

## Fase 5 - Generador de README

Estado: pendiente.

Secciones objetivo:

```markdown
# Project Name

## Overview
## Tech Stack
## Requirements
## Installation
## Usage
## Commands
## Project Structure
## Testing
## Build
## Environment Variables
## Contributing
## License
```

Reglas:

- Usar contenido detectado, no texto generico cuando haya datos reales.
- Preservar contenido manual fuera del bloque `AUTOREADME`.
- Si no existe README, crear uno completo.
- Si existe README sin marcadores, insertar bloque generado sin destruir contenido manual salvo que se use `--force`.
- `--dry-run` muestra cambios sin escribir.
- `--backup` crea respaldo antes de modificar.
- `--force` permite sobrescritura completa.

## Fase 6 - Autoactualizacion de README

Estado: pendiente.

Sin Pages. Solo `README.md`.

Workflow opcional generado por:

```bash
autoreadme init --github-action
```

Workflow objetivo:

```yaml
name: Auto README

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  readme:
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
```

## Fase 7 - Publicacion npm

Estado: pendiente.

Entregables:

- Preparar paquete con `files`, `bin`, versionado y licencia.
- Agregar `npm run build`.
- Agregar `npm test`.
- Validar `npm pack`.
- Publicar con:

```bash
npm login
npm publish --access public
```

## Fase 8 - Calidad

Estado: pendiente.

Pruebas requeridas:

- Deteccion por stack.
- Generacion de README desde cero.
- Actualizacion con marcadores.
- Preservacion de contenido manual.
- `--dry-run` sin escritura.
- `--backup`.
- `--force`.
- Workflow opcional generado correctamente.

## Historial del proyecto anterior

El proyecto actual ya contiene trabajo reutilizable:

- Detector PowerShell de stacks.
- Generador inicial con `-ProjectPath`, `-DryRun` y `-Force`.
- Pruebas basicas en `tests/run-tests.ps1`.
- Experimentos con workflow de GitHub.

Ese trabajo se considera base tecnica, pero el producto final sera `autoreadme` como CLI npm enfocada solo en `README.md`.

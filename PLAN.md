# Plan de documentacion automatica en GitHub

## Estado actual

Proyecto activo: `C:\Users\luis\Desktop\Otros\DocumentacionGit`

Estado al 2026-04-29:

- Base del template creada.
- `README.md`, `docs/`, `scripts/`, `mkdocs.yml`, `.github/workflows/docs.yml`, `.markdownlint.json` y `lychee.toml` existen.
- `docs/project-detection.json` fue regenerado con la ruta actual del proyecto.
- El proyecto aun no esta inicializado como repositorio Git local.
- La ejecucion directa de scripts PowerShell esta bloqueada por la politica local; se puede ejecutar con `powershell -NoProfile -ExecutionPolicy Bypass -File`.

## Objetivo

Crear un sistema reutilizable para que cualquier repositorio mantenga su documentacion actualizada automaticamente en cada commit, con un README profesional en la raiz y documentacion completa publicada en GitHub Pages.

## Fases de implementacion

### Fase 1 - Base reutilizable del template

Estado: completada.

Entregables:

- Estructura minima del template.
- README profesional generado desde plantilla.
- Documentacion MkDocs inicial.
- Script de deteccion de stack del proyecto.
- Script central de generacion de documentacion.
- Workflow de GitHub Actions para validacion, generacion y despliegue.

Pendiente:

- Sin pendientes tecnicos de la fase base.

Completado:

- `scripts/generate-docs.ps1` acepta `-ProjectPath` para generar documentacion en una ruta destino.
- `scripts/detect-project.ps1` valida que la ruta exista antes de detectar el stack.
- `scripts/detect-project.ps1` detecta remoto Git cuando existe.
- `scripts/detect-project.ps1` incluye deteccion basica de proyectos .NET.
- `scripts/generate-docs.ps1` actualiza `repo_url` en `mkdocs.yml` desde el remoto GitHub cuando existe.
- Si no hay remoto Git, `repo_url` queda comentado para evitar `OWNER/REPOSITORY`.
- `scripts/generate-docs.ps1` incluye `-CheckPrerequisites` para validar herramientas locales.
- README y documentacion explican como usar `-ProjectPath`.
- Generacion local verificada con la ruta actual del proyecto.
- Chequeo local de prerequisitos verificado: faltan `mkdocs` y `markdownlint` en esta maquina.

### Fase 2 - Aplicacion sobre repositorios reales

Estado: completada.

Entregables:

- Comando para instalar/copiar el template en cualquier repositorio.
- Deteccion de stack mas completa.
- README generado con datos reales del proyecto.
- Documentacion tecnica inicial basada en archivos detectados.

Completado:

- El template modifica el repositorio destino directamente cuando se usa `-ProjectPath`.
- `-DryRun` muestra cambios sin escribir archivos.
- Los archivos existentes en repositorios destino se omiten por defecto.
- `-Force` permite sobrescribir archivos existentes de forma explicita.
- El generador copia archivos base del template al repositorio destino cuando faltan.
- `mkdocs.yml` se actualiza con `ProjectName`, `Description` y remoto Git cuando existe.
- Aplicacion en carpeta destino limpia verificada con `phase2-test-target-2`.
- Proteccion de archivos existentes verificada ejecutando el generador dos veces sin `-Force`.
- Sobrescritura explicita verificada con `-Force`.
- La carpeta `phase2-test-target` conserva una prueba inicial y `phase2-test-target-2` conserva la prueba corregida.
- README generado incluye metadata real detectada: stacks, gestores de paquetes, generadores de documentacion y remoto Git.
- `docs/index.md` incluye la misma metadata detectada.
- Probado sobre repositorio real `FaiCP/ProlaceReact` (React + TypeScript + Vite + Tailwind).
- `detect-project.ps1` mejorado: parsea `package.json` para detectar react, vue, angular, next, nuxt, svelte, typescript, tailwindcss, vite.
- Falso positivo de typedoc eliminado: solo se agrega si existe en dependencias.
- Deteccion correcta verificada: `node, react, typescript, tailwindcss, vite` con `npm` y remoto GitHub real.

### Fase 3 - Automatizacion en GitHub

Estado: en progreso.

Objetivo ajustado: solo auto-actualizar README en cada push a main. Sin Pages, sin MkDocs, sin markdownlint, sin lychee.

Entregables:

- Workflow simplificado: push → generate-docs.ps1 → auto-commit README si cambio.
- Repositorio remoto creado y conectado.
- Workflow verificado en GitHub Actions.

Pendiente:

- Crear repositorio remoto en GitHub y conectar origin.
- Hacer primer push a main.
- Verificar que Actions ejecuta y auto-commitea README actualizado.

Completado:

- Workflow simplificado a un solo job: checkout → generate README → auto-commit README.md.
- Eliminados: MkDocs, markdownlint, lychee, Pages, check-github-readiness.
- `.gitignore` excluye `site/`, cache, `node_modules/` y carpetas de prueba.
- Git local inicializado. Rama `main`. Commit base `50367c2` existe.

### Fase 4 - Calidad y mantenimiento

Estado: completada parcialmente.

Entregables:

- Documentacion de configuracion.
- Guia de contribucion.
- Pruebas basicas de scripts.
- Checklist de release del template.

Pendiente:

- Confirmar `mkdocs build --strict` cuando `mkdocs` este instalado.
- Confirmar `markdownlint "**/*.md"` cuando `markdownlint` este instalado.

Completado:

- `tests/run-tests.ps1` agregado con pruebas para deteccion Node, Python, .NET, Java, Go y Rust.
- Prueba de `-DryRun` agregada para confirmar que no escribe archivos.
- `docs/stacks.md` agregado con ejemplos por stack.
- `docs/troubleshooting.md` agregado con errores comunes de PowerShell, MkDocs, markdownlint, lychee, Pages y Git.
- `docs/release-checklist.md` agregado como checklist de publicacion.
- `Makefile` incluye target `test`.
- Pruebas automatizadas ejecutadas correctamente con `tests/run-tests.ps1`.

## Flujo principal

1. El desarrollador hace commit y push.
2. GitHub Actions valida el README, Markdown y links.
3. El sistema regenera la documentacion.
4. Si hay cambios generados, crea un commit automatico.
5. Si el cambio llega a `main`, publica la documentacion en GitHub Pages.

## Estructura recomendada

```text
repo/
├─ README.md
├─ docs/
│  ├─ index.md
│  ├─ getting-started.md
│  ├─ architecture.md
│  └─ api.md
├─ scripts/
│  └─ generate-docs.ps1
├─ mkdocs.yml
├─ Makefile
└─ .github/
   └─ workflows/
      └─ docs.yml
```

## README profesional

El `README.md` de la raiz debe funcionar como la portada tecnica del proyecto:

- Nombre claro del proyecto y descripcion breve.
- Badges de build, documentacion, version, licencia y ultimo commit.
- Demo visual, screenshot o GIF cuando aplique.
- Instalacion rapida.
- Uso basico.
- Features principales.
- Arquitectura resumida.
- Comandos disponibles.
- Roadmap.
- Guia de contribucion.
- Licencia.

## Herramientas base

- `MkDocs Material` para documentacion general.
- `GitHub Actions` para automatizacion.
- `GitHub Pages` para publicacion.
- `markdownlint-cli` para calidad Markdown.
- `lychee` para links rotos.
- Generadores por lenguaje cuando aplique: `typedoc`, `pdoc`, `sphinx`, `javadoc`, `godoc` o `cargo doc`.

## Archivos creados

- `README.md`: portada profesional del repositorio.
- `docs/`: documentacion tecnica publicada con MkDocs.
- `scripts/generate-docs.ps1`: generador central.
- `scripts/detect-project.ps1`: detector de stack del repositorio.
- `scripts/README.template.md`: plantilla editable del README.
- `.github/workflows/docs.yml`: automatizacion completa.
- `.markdownlint.json`: reglas de Markdown.
- `lychee.toml`: reglas de validacion de links.

## Politica de automatizacion

- En `pull_request`: validar sin escribir cambios.
- En `push` a ramas normales: validar y generar.
- En `push` a `main`: generar, auto-commitear cambios y publicar.
- Evitar loops ignorando commits con mensaje `chore(docs): update generated documentation [skip ci]`.

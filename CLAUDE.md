# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A 16-week learning monorepo for a senior developer transforming into a Healthcare Software Engineer. Each week is an independent pnpm workspace package under `weeks/`. The project is an active learning system — code contains pedagogical structures that must be preserved.

## Commands

### Monorepo (root)
```bash
pnpm install          # Install all workspace dependencies
pnpm dev:all          # Run all packages in dev mode via Turbo
pnpm build:all        # Build all packages
pnpm test:all         # Run all test suites
pnpm lint:all         # Lint all packages
pnpm format:all       # Prettier over all TS/JS/JSON/MD files
```

### Per-week package (e.g., `weeks/week-01-typescript/`)
```bash
pnpm dev              # Watch mode (tsc --watch)
pnpm build            # Compile TypeScript
pnpm test             # Run tests (node --test)
pnpm test:types       # Type-level tests via tsd
pnpm lint             # ESLint
pnpm type-coverage    # Check type annotation coverage (>95% goal)
```

### Utility scripts (root)
```bash
./scripts/setup-week.sh      # Scaffold a new week
./scripts/check-progress.sh  # Check overall progress
./scripts/generate-report.sh # Weekly summary report
```

## Monorepo Architecture

- **`weeks/week-XX-<topic>/`** — Self-contained weekly projects. Each has its own `package.json`, `tsconfig.json`, and full source tree. They do not import from each other.
- **`shared/`** — Shared utilities across weeks (currently thin).
- **`certs/`** — Certification study materials (AWS Developer, Azure AI-102).
- **`journey/`** — Personal learning journal (Obsidian vault): `DAILY-LOG.md`, `WEEKLY-REVIEWS.md`, `WINS.md`, `CERTIFICATIONS.md`.
- **`docs/`** — Global guides: `PEDAGOGICAL-STYLE-GUIDE.md`, `TRACKING-SYSTEM-GUIDE.md`, `GETTING_STARTED.md`.
- **`.claude/skills/`** — Claude Code skill definitions: `week-scaffold`, `daily-standup`, `progress-update`, `weekly-review`.

Turbo is configured in `turbo.json` with pipeline tasks: `build → test → lint/type-check/dev/clean`.

## Week Package Structure

Each week follows:
```
week-XX-<topic>/
├── README.md              # 7-day sprint guide
├── sprint-week-XX.md      # Day-by-day task breakdown
├── GUIA-CONCEPTOS.md      # Deep concept explanations (Spanish)
├── RECURSOS.md            # Curated links by day
├── AGENTS.md              # Per-week context for Claude Code
├── questionaries/QUESTIONS.md
└── src/                   # Source with pedagogical comments
```

Always read the week's `AGENTS.md` before working within a specific week — it contains detailed architecture, code conventions, and constraints specific to that week.

## Pedagogical Code Conventions

Source files follow a strict commenting structure defined in `docs/PEDAGOGICAL-STYLE-GUIDE.md`:

- **File header**: `DÍA [X]: <concept>` with `CONCEPTOS CLAVE` list
- **Section separators**: `// ====...==== TAREA [X.Y]: NAME ====...====`
- **Export docs**: Problem statement + solution + healthcare application context
- **Exercises**: `// EJERCICIO [N]` blocks with hints — **never complete these unless explicitly asked**
- **Learning notes**: `// NOTAS DE APRENDIZAJE` section at end of file (updated after each day)

Code identifiers are in English; all comments and documentation are in Spanish.

## Week 1 TypeScript Constraints

Week 1 (`weeks/week-01-typescript/`) is the active week. Key constraints:
- Zero runtime dependencies — pure TypeScript type-system learning
- All strict compiler flags enabled + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`
- No `any` (ESLint enforced), no non-null assertions (`!`)
- Use `Result<T, E>` for error handling instead of try/catch
- Use `unknown` + type guards instead of `as` casts
- `noUnusedLocals`/`noUnusedParameters` are intentionally disabled (exercise stubs exist)

## Journey / Tracking Files

- `journey/DAILY-LOG.md` — daily progress entries
- `journey/WEEKLY-REVIEWS.md` — end-of-week retrospectives
- `journey/WINS.md` — milestone celebrations
- Update these after completing work sessions, not mid-session

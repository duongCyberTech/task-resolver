# Project profile

How this repo is built, tested, run and checked. Every stage reads this file instead of guessing.
Written by `/task-resolver:setup` (or at the first intake) from `scripts/detect-stack.sh`, the CI
config and the README, then confirmed by the user. **Edit it freely**: it belongs to the user.

**Confirmed by the user:** <YYYY-MM-DD / not yet>
**Detected from:** <manifests, CI files, Makefile targets read>

## Stack

| Part (root) | Language / framework | Package manager |
|---|---|---|
| `.` | <e.g. TypeScript, Next.js> | <pnpm> |

## Commands

Use `<file>` and `<files>` as placeholders the stages fill in. Leave a row as `—` if it doesn't apply.

| Purpose | Command | Notes |
|---|---|---|
| Install deps | `<cmd>` | |
| Test, one file | `<cmd> <file>` | how to run a single test file or case |
| Test, full suite | `<cmd>` | what CI runs; say if it's too slow to run locally |
| Lint | `<cmd> <files>` | judged against the baseline: no **new** offences |
| Format check | `<cmd>` | |
| Type check | `<cmd>` | judged against the baseline error count |
| Build / compile | `<cmd>` | including asset bundling, if the change touches assets |
| Migrations | `<create / apply / check schema dump>` | |
| Run the app | `<cmd>` | URL or port: <…> |

## CI-equivalent checks

The checks a change must pass before it counts as done. Copy them from the CI config, not from memory.

1. <check> — `<cmd>`

## Running the app and verifying behaviour

| Item | Value |
|---|---|
| Kind of project | <web app / HTTP API / CLI / library / mobile / desktop / data pipeline / infra> |
| Where it runs | <host / docker compose service `web` / devcontainer / simulator> |
| How to verify a change | <browser via Playwright MCP / HTTP requests / run the CLI / REPL / unit harness only> |
| Logins / test accounts | <how to get one; never paste secrets here> |
| Console / REPL for server-side checks | <e.g. `bin/rails console`, `python manage.py shell`, `iex -S mix`, none> |
| One-off scripts folder | `.claude/workflows/scripts/` (or: <…>) |
| Outbound side effects to stub | <email, SMS, payments, webhooks — and how they're caught in dev> |

## Conventions

- Tests live in: <paths and naming>
- Comment density: <match the file / sparse / docstrings required>
- Other house rules: <from CONTRIBUTING, CLAUDE.md, linters>

## Known traps

- <environment or tooling trap> — <how it shows up, how to avoid it>

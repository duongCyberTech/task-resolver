# Implementation — <task title>

## Baseline (before the first edit, <date>)

| Check | Result |
|---|---|
| `<test file>` | <runs, failures — which ones> |
| `npx tsc --noEmit` | <n> errors (pre-existing) |
| rubocop on files to be edited | <n> offences |

## Logs

| # | Sub-task | Log | Deviations from plan |
|---|---|---|---|
| 1 | <title> | [01-<slug>.md](01-<slug>.md) | <none / short> |
| — | Dev verification | [NN-dev-verification.md](NN-dev-verification.md) | |
| — | Follow-up: <…> | [NN-followup-<slug>.md](NN-followup-<slug>.md) | |

## Files

**New:** `<path>` …
**Changed:** `<path>` …
**Deleted:** `<path>` — <why nothing else needs it>

## Tests and CI-equivalent checks (after the last sub-task)

| Check | Result |
|---|---|
| `<test file>` | <runs, assertions, 0 failures> |
| `RAILS_ENV=test bin/rails webpacker:compile` | <exit 0 / not needed — no asset change> |
| `npx tsc --noEmit` | <n> errors — none in changed files / same as baseline |
| rubocop on changed files | no new offences |
| Full suite (`bundle exec rails test`, what CI runs) | <not run locally — why> |

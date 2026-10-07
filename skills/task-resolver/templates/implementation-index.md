# Implementation — <task title>

## Baseline (before the first edit, <date>)

| Check | Result |
|---|---|
| `<test command> <file>` | <runs, failures — which ones> |
| Type check (`<profile command>`) | <n> errors (pre-existing) / — not in profile |
| Lint on files to be edited (`<profile command>`) | <n> offences |

## Logs

| # | Sub-task | Log | Branch | Deviations from plan |
|---|---|---|---|---|
| 1 | <title> | [01-<slug>.md](01-<slug>.md) | `<branch>` | <none / short> |
| — | Dev verification | [NN-dev-verification.md](NN-dev-verification.md) | `<branch>` | |
| — | Follow-up: <…> | [NN-followup-<slug>.md](NN-followup-<slug>.md) | `<branch>` | |

## Files

**New:** `<path>` …
**Changed:** `<path>` …
**Deleted:** `<path>` — <why nothing else needs it>

## Tests and CI-equivalent checks (after the last sub-task)

| Check | Result |
|---|---|
| `<test command> <file>` | <runs, assertions, 0 failures> |
| Build / compile (`<profile command>`) | <exit 0 / not needed — why> |
| Type check | <n> errors — none in changed files / same as baseline |
| Lint on changed files | no new offences |
| Schema / migration check | <ok / not needed — no migration> |
| Full suite (`<profile command>`, what CI runs) | <run: result / not run locally — why> |

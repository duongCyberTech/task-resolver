# <Task title> — task summary

**Archived:** <YYYY-MM-DD> · **Worked:** <start> → <end> · **Loops:** <n>
**Branch:** `<from STATUS / .git/HEAD>` · **Commit(s):** <hash + subject, or "uncommitted", or "not checked (git reads not allowed)">
**Requirements:** [`requirements/`](requirements/) — <files> (snapshot; the workframe is overwritten by the next task)

<2–4 lines: what the feature does for the user, and the one design fact that shaped it.>

### The requirement, verbatim

> <quote every requirement file that carries text; name the media files and where their frames are>

---

## Checkpoint

<copy of STATUS → Checkpoint, true states — ⬜ for anything that never ran>

| # | Stage | Status | Notes |
|---|---|---|---|

### To resume  <!-- only if unfinished -->

<the exact next step (e.g. "get approval on testing/scenarios/ — two questions in its index"), what
to restore (`/trlr:resume <this folder>`), and what state the code is in (committed? which branch?)>

### ⚠️ Where the code is  <!-- only if the key files are not in the current checkout -->

<branch recorded, files checked, what was found>

---

## What was built

```
<diagram: entry points → services → data>
```

**New:** `<path>` — <one line>
**Changed:** `<path>` — <one line>
**Deleted:** `<path>` — <why>

## Decisions

| # | Question | Decision |
|---|---|---|

### Corrections to the handoff

| # | Handoff claimed | Reality | What shipped instead |
|---|---|---|---|

### Plan revisions

| R | Change | Kind | What it reworked |
|---|---|---|---|

### Known consequences, accepted

- <consequence> — <where it was raised and accepted>

## Defects found and fixed

| # | Found by (implementation / dev verification / testing / audit / review) | Defect | Fix + test |
|---|---|---|---|

## Pre-existing bugs — reported, not fixed

- `<file:line>` — <what, measured impact, suggested fix>

## Open at archive

1. <most important first — decisions pending, flows never run, risks for release>

## Test coverage at archive

| Suite | Runs | Assertions | Result |
|---|---|---|---|

| CI-equivalent check | Result |
|---|---|
| `RAILS_ENV=test bin/rails webpacker:compile` | |
| `npx tsc --noEmit` | |
| rubocop on changed files | |
| Full suite (`bundle exec rails test`) | <run / not run locally — why> |

**Not covered by any automated test:** <e.g. the JavaScript — there is no JS harness>

## Traps recorded during the build

1. <trap> — <how it showed up, how to avoid it>

## Dev data left in place

| Where | What | Cleanup |
|---|---|---|

## Archive contents

- `STATUS.md` — the live checkpoint as it stood at archive
- `requirements/` — the requirement snapshot (<files>; media not copied: <path, size>)
- `discussion/` — <files>
- `planning/` — <files, demo/, frames>
- `implementation/` — <n> logs, <dev verification, fixes, follow-ups>
- `testing/` — <scenarios / logs / audits, or "not reached">
- `code-review/` — <n> findings, or "not reached"
- `loops/`, `superseded/` — <what earlier loops / abandoned approaches are kept>

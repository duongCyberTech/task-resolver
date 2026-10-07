# Status — <task title>

| Field | Value |
|---|---|
| Slug / archive folder | `<YYYY-MM-DD>-<slug>` |
| Started | <YYYY-MM-DD> |
| Loop | 1 |
| Branch now | `<from .git/HEAD>` — full history in **Branches** below |
| Requirements | `.claude/workflows/workframe/requirements/index.md` → <files> |
| Project profile | `.claude/workflows/workframe/project.md` — <stack, one line> (confirmed <date> / draft) |
| Snapshot | `requirements/` taken <date> (at intake / at adoption) |
| Stages | <from config.json at intake: requirements, discuss, plan, …> — excluded: <list / none> |
| Plan format | markdown / html (html-plan, scope <…>) / markdown (--html declined <date>) |
| **Current stage** | <e.g. Discuss — ⏸ waiting at G1> |
| **Next action** | <e.g. user answers Q1–Q5, then `/task-resolver:next`> |

## Constraints (from the requirement and `workframe/rules/`)

| Constraint | Value |
|---|---|
| Allowed files | <list, or "not restricted"> |
| Git allowed | <e.g. diff> |
| Environments | <e.g. development, staging> |
| Other | <must / only / don't lines, quoted> |

## Branches

Every branch this task's code has been built on, in order. A row is added whenever the branch read at a
stage start or before a sub-task differs from the last row (SKILL.md → Branches).

| # | Branch | Repo / root | Role | From | To | Work done here | Commits | Merged into |
|---|---|---|---|---|---|---|---|---|
| 1 | `<branch, or detached <sha>>` | `.` | intake | <date> | <date / —> | <stages, sub-tasks NN, follow-ups, fixes> | <hashes, "uncommitted", or "not checked"> | <branch + date / no / not checked> |

## Checkpoint

Icons: ⬜ not started · ▶ in progress · ⏸ waiting at gate · ✅ done · ⏭ skipped (user's call, or `excluded (config)`) · ⛔ blocked · ♻ superseded · ⟳ rework

| # | Stage | Status | Date | Notes |
|---|---|---|---|---|
| 1 | Intake | ⬜ | | |
| 2 | Discuss (G1) | ⬜ | | |
| 3 | Plan (G2) | ⬜ | | |
| 4 | Implement | ⬜ | | 0/<n> sub-tasks |
| 5 | Test scenarios (G3) | ⬜ | | |
| 6 | Test run | ⬜ | | |
| 7 | Audit | ⬜ | | |
| 8 | Code review | ⬜ | | |
| 9 | Feedback | ⬜ | | |
| — | Archive | ⬜ | | |

## Gate log

| Gate | Asked (date) | Question (short) | Answered (date) | User's answer |
|---|---|---|---|---|

## Scope changes

| Date | Change (incl. allowed-files widening) | Approved at |
|---|---|---|

## Plan revisions

| R | Date | Change (short) | Kind | Rework / stale | Answer |
|---|---|---|---|---|---|

## Follow-ups after the plan

| Date | Request | Log |
|---|---|---|

## Dev data written

| Date | Where | What | Cleanup |
|---|---|---|---|

## Requirements manifest

| File | Size | mtime |
|---|---|---|

## Open items

1. <most important first>

## History

- <date> — <stage entered/left, stop point, correction, resume/adoption>

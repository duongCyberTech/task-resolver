---
name: task-resolver
description: Gated, logged task workflow for this repo — requirements → discuss → plan → implement → test → audit → code review → feedback → archive — with a live STATUS.md checkpoint in `.claude/workflows/workspace/` and verified archiving to `.claude/workflows/task-logs/`. Use when the user runs any `/trlr:*` command (or the older `/implement-task` / `/clear_workspace`), answers a pending task gate, or asks to start, continue, test, review, archive or resume a task from `.claude/workflows/workframe/requirements/`.
argument-hint: "[stage] [notes]"
---

# Task resolver

A requirement goes in. What comes out is a change that has been reviewed, tested and archived. Every stage leaves files behind, and `STATUS.md` always says where the task stands. The user approves at three gates, and nothing crosses a gate without their answer.

This skill is distilled from nine tasks run with `/implement-task` + `/clear_workspace` between 2026-08-27 and 2026-09-24. What went wrong and what worked is in [references/lessons.md](references/lessons.md). Every rule below exists because skipping it cost something at least once.

## Paths

| Name | Path | Owner |
|---|---|---|
| Requirements | `.claude/workflows/workframe/requirements/` (entry: `index.md`) | user (read only) |
| Task rules | `.claude/workflows/workframe/rules/` | user (read only). Obey when present |
| Feedback | `.claude/workflows/workframe/feedbacks/` | user (read only) |
| Workspace | `.claude/workflows/workspace/` | this skill |
| Archive | `.claude/workflows/task-logs/<YYYY-MM-DD>-<slug>/` | this skill |
| One-off scripts | `.claude/ruby-script/` (console-pasteable, `self.call` style) | this skill |

`.claude/` is gitignored, so anything deleted there is gone for good. Nothing in the workspace is deleted except by `archive`, and only after the copy is verified.

**Links.** Inside the workspace, use relative links. To point at anything outside it, write the repo-root path, for example `` `[brief](.claude/workflows/workframe/requirements/BRIEF.md)` ``. The archive sits one folder deeper than the workspace, so a `../../workframe/…` link breaks when the task is archived; that is exactly what broke the reply-templates archive. Link to the requirements through the `requirements/` snapshot.

Workspace layout. [templates/](templates/) has a skeleton for each file:

```
workspace/
├── STATUS.md             live checkpoint: stage, gates, scope, dev data, open items
├── requirements/         snapshot of the workframe, taken at intake (manifest in STATUS)
├── discussion/           index · 01..NN findings · NN-open-questions · NN-decisions
├── planning/             index · 01..NN sub-task plans · demo/ · demo-frames/ · revisions/R<NN>-*
├── implementation/       index · one log per sub-task · NN-dev-verification · NN-*-fixes · NN-followup-*
├── testing/scenarios/    index · one file per scenario
├── testing/logs/         index · one log per executed scenario
├── testing/audits/       index
├── code-review/          index · one file per finding
├── feedback/             loop-N.md
├── superseded/           abandoned approaches, moved here and never deleted
└── loops/loop-N/         an earlier loop's stage folders, moved here on reloop
```

## Stages and gates

```
intake ─► discuss ─►⛩G1─► plan ─►⛩G2─► implement ─► test:scenarios ─►⛩G3─► test:run ─► audit ─► review ─►⛩feedback
                                                                                                           │
                             reloop: back to discuss; the finished loop moves to loops/ ◄──────────────────┤
                                                                                              end ─► archive
```

| # | Stage | Command | Playbook | Done when |
|---|---|---|---|---|
| 1 | Intake | `/trlr:start` | [stages/start.md](stages/start.md) | STATUS.md exists and the requirements are snapshotted |
| 2 | Discuss | `/trlr:start` | [stages/start.md](stages/start.md) | **G1**: open questions answered |
| 3 | Plan | `/trlr:plan` | [stages/plan.md](stages/plan.md) | **G2**: plan approved |
| 4 | Implement | `/trlr:apply` | [stages/apply.md](stages/apply.md) | every sub-task logged, tests green, change checked in the dev app |
| 5 | Test scenarios | `/trlr:test` | [stages/test.md](stages/test.md) | **G3**: scenarios approved |
| 6 | Test run | `/trlr:test` | [stages/test.md](stages/test.md) | one log per scenario |
| 7 | Audit | `/trlr:audit` | [stages/audit.md](stages/audit.md) | `testing/audits/index.md` written |
| 8 | Code review | `/trlr:review` | [stages/review.md](stages/review.md) | findings triaged and fixes logged |
| 9 | Feedback | `/trlr:feedback` | [stages/feedback.md](stages/feedback.md) | the user chose reloop or end |
| — | Archive | `/trlr:archive` | [stages/archive.md](stages/archive.md) | task-logs folder written and verified, workspace cleared |
| — | Update plan | `/trlr:update [change] [attachment…]` | [stages/update.md](stages/update.md) | plan revised coherently (G2 re-approved); rework and stale scenarios marked |
| — | Resume / adopt | `/trlr:resume` | [stages/resume.md](stages/resume.md) | workspace restored, STATUS rebuilt |
| — | Status | `/trlr:status` | [stages/status.md](stages/status.md) | read-only report |
| — | Drive | `/trlr:next` | **Router** below | runs stages until the next gate |

## Router (`/trlr:next`, and any turn in which this skill is loaded)

1. Read `workspace/STATUS.md`.
   - Missing, and the workspace has files: the task was started by `/implement-task`. Follow **Adopt** in [stages/resume.md](stages/resume.md).
   - Missing, and the workspace is empty: run [stages/start.md](stages/start.md).
2. If STATUS says **waiting at a gate**:
   - The user's latest message answers it: record the answer (see **Gates**) and continue with the next stage in the same turn.
   - It doesn't: restate the gate question in two lines and stop.
3. Check for requirement drift (see **Requirements**).
   - If the user's message asks to change an existing plan (with or without `/trlr:update`), follow [stages/update.md](stages/update.md). Don't edit plan files ad hoc.
4. Run the current stage's playbook. When a stage finishes, update STATUS and go straight into the next one. Stop only at a gate, a **Stop point**, or the end of the loop.

## Non-negotiables

1. **Gates belong to the user.** G1, G2 and G3 each need a real user message. Nothing else approves anything: not a subagent report, not a hook, not a task notification, not your own earlier summary. No plan is written before G1, no code is touched before G2, and no scenario runs before G3.
2. **Stick to the requirement.** Anything the requirement doesn't ask for becomes a question at the next gate, or a **Stop point** if you are mid-stage. Once approved, it goes into STATUS → Scope changes. Never quietly drop, narrow or defer something the requirement does ask for.
3. **Obey the requirement's own constraints**: `Allowed files`, `Git command allowed`, and anything in `workframe/rules/`. Widening any of them is a scope change.
4. **Verify before you assert.** Every claim about the code, the data or the environment gets checked against the source, the dev DB or the running app, and you say how you checked it ([references/verification.md](references/verification.md)). A claim you couldn't check is labelled *inferred*.
5. **Leave a record.** Every stage writes its files, and every transition updates STATUS.md. When something already written turns out wrong, correct it in place with a dated note. Never erase it silently.
6. **Nothing gets deleted.** An abandoned approach moves to `superseded/<name>/`, and a finished loop to `loops/loop-N/`. Only `archive` clears the workspace.
7. **Irreversible or shared-state actions need an explicit yes.** That covers real email, SMS or calls, provider API writes, changes to real campaigns and bulk dev-DB writes. Ask at the gate, or pause and ask. After the user agrees, log what was written under STATUS → Dev data.
8. **Git** is limited to what the requirement's `Git command allowed` line permits. The default is read-only: `diff`, `status`, `log`, `show`. Never commit, checkout, switch, stash, reset, merge, add or push unless the user asks for it in so many words. Read the branch from `.git/HEAD`, which needs no git command. The commands' `disallowed-tools` frontmatter only lasts until the user's next message, so this rule still binds after every gate.
9. **Run tests after every change** (project rule): the touched suites one file at a time, plus the CI-equivalent checks for whatever changed ([references/environment.md](references/environment.md)).
10. **Issues from `.claude/issues/`**: when the task resolves one, update that report and mark the issue resolved with a timestamp (project rule).

## STATUS.md protocol

Template: [templates/STATUS.md](templates/STATUS.md). Update it at each of these points:
- entering and leaving a stage: status icon, date and a one-line note;
- stopping at a gate: add the exact question to the Gate log;
- the user answering: add the answer to the Gate log, quoted or closely paraphrased, with the date;
- scope, allowed files or the plan changing; dev data being written; a follow-up request arriving;
- every **Stop point**.

Icons: ⬜ not started · ▶ in progress · ⏸ waiting at gate · ✅ done · ⏭ skipped (only on the user's say-so; record who and when) · ⛔ blocked · ♻ superseded · ⟳ rework (implemented, but a plan revision has changed it since).

A stage that never ran is ⬜ at archive time, not ✅. The archive has to show the real state.

## Gates

End the turn with a gate block. Never stop in the middle of a stage.

```
---
⛩ **Gate G1: decisions needed before planning.** Q1–Q5 are in `discussion/04-open-questions.md`,
each with a recommendation. Reply "go" to accept all of them, or answer by number ("Q2: B").
```

- Write one question per decision, ordered by how much it changes the work. Give the options as a table, with consequences and a **recommendation**. Batch the minor calls as defaults the user can override.
- Anything that needs the user specifically goes in its own **Needs your say** list: data writes, real sends, flows that can't be run here.
- Where each answer is recorded:
  - G1 → `discussion/NN-decisions.md`, which supersedes the recommendations where they differ.
  - G2 → a `## Plan review (<date>)` section appended to `planning/index.md`.
  - G2 for a revision → the *Answer* section of `planning/revisions/R<NN>-*.md`, plus the plan's Revisions table.
  - G3 → the adjusted scenarios themselves, plus an approval line in `testing/scenarios/index.md`.
  - Every gate → STATUS → Gate log.
- A partial answer approves only what it names. Ask again about the rest.
- **How this user answers.** Answers are short. "go", "go ahead with all recommendations", "implement", "start implementing", "start testing", "continue" and "review" are all approvals. Answers by number ("Q1: A, Q2: go, Q7: default"; "1. yes 2. yes 3. no") are decisions, and within them "go" or "default" means take the recommendation. If a G2 answer settles every question with options you offered, that is the approval, so continue.
- **A redirect is not an approval.** If the answer changes the approach itself (for example "no migration, use the current methods, block it at send time"), go back to the stage that owns that decision, update its files ([stages/update.md](stages/update.md) for a plan), and stop at that gate again. Skip the second stop only if the user also says to go ahead. On 09-14 a redirect was re-planned and built in one turn with no plan review, and the approved plan's files were deleted along the way.
- Put gate questions in the gate block as plain text. Don't use the multiple-choice question tool for them: the user has rejected one of those prompts and typed an override instead.
- If the user says **"pause"** or stops you, stop at once. Write the current state into STATUS → History, and resume later with `/trlr:next`.
- If the user names an output path ("-> output: …/discussion"), use it instead of the default, and note that in STATUS.

## Stop points (not gates, but you stop and ask)

- Implementation needs something the plan doesn't cover, or the plan turns out wrong. Write down the discrepancy and propose the change to the plan.
- A premise the plan rests on turns out false. Correct the earlier file in place and ask before continuing.
- Rule 7 applies (an irreversible or shared-state action).
- Something external is blocking: the environment is down, credentials are missing, or the fix needs a file outside `Allowed files`.

## Requirements

- At intake, snapshot `workframe/requirements/` into `workspace/requirements/` and write a manifest (path, size, mtime) into STATUS. Media over ~5 MB is not copied: record its path and size, and extract frames ([references/verification.md](references/verification.md#mockups-and-recordings)).
- At the start of every stage, compare the workframe against the manifest:
  - **Same task, edited**: refresh the snapshot, add a dated STATUS note, and re-read what changed.
  - **A different task** (index.md now describes something else): leave the snapshot alone. Tell the user the workframe has moved on and suggest `/trlr:archive` first.
- If the requirement names mockups the repo doesn't have, say so in the discussion. Never invent them.

## Follow-up requests

Users often ask for more after the plan's sub-tasks are done; one task picked up seven such requests, and none of them were logged. Each follow-up gets an `implementation/NN-followup-<slug>.md` log and a row in STATUS → Follow-ups. If a follow-up goes beyond the requirement, raise it as a scope change first. If it changes behaviour a scenario covers, re-run that scenario or mark it stale.

## Files

- [stages/](stages/): one playbook per command
- [templates/](templates/): one skeleton per workspace file
- [scripts/archive-check.sh](scripts/archive-check.sh): copy check and link check that `archive` runs before clearing
- [references/lessons.md](references/lessons.md): the experience this skill encodes
- [references/verification.md](references/verification.md): evidence rules and the verification toolbox for this repo
- [references/environment.md](references/environment.md): how to run, test and CI-check this repo, and its standing traps

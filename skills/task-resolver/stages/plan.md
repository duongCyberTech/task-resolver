# Stages 3–4: plan and plan review (`/trlr:plan [notes]`)

**Precondition:** G1 is answered, and STATUS links the decisions file. If it isn't, go back to the router.

## Write the plan

Write `planning/index.md` ([template](../templates/plan-index.md)), plus one `NN-<slug>.md` per sub-task ([template](../templates/plan-subtask.md)). Each sub-task file has: Title · Description · Related resource files (`file:line`) · Flow (an ASCII activity diagram) · Migration · Exceptions · Edge cases · Unclear issues.

- **Stay with the requirement and the decisions.** Every sub-task names the requirement section or decision it serves. A step that serves neither goes under *Unclear issues*, not into the plan.
- A sub-task is one reviewable change. Split by layer only when each layer can be tested on its own. Tests are a sub-task of their own, and every sub-task also names its tests.
- `index.md` carries:
  - links to the requirement and the decisions;
  - the sub-task table (#, title, files, status);
  - a **Settled scope** table and a diagram of the change's shape;
  - build order and dependencies, and risks;
  - an out-of-scope list (what is deliberately not done, and why);
  - the test plan outline.
- For every new column or flag, the plan must say what a NULL or legacy row does. `follow_up_kind` was made an *exclusion*: an inclusion would have silently stopped every existing campaign sequence.
- Migrations: strong_migrations is a no-op locally, so plan batched backfills anyway. Say how `db/structure.sql` will be regenerated ([../references/environment.md](../references/environment.md#database)).
- If a demo was requested, build `planning/demo/`: static HTML and CSS, reusing the real stylesheet tokens where possible, with Playwright screenshots. Keep every iteration (`demo/v1/`, `demo/v2/`, …), because the user has asked to "revert to previous demo" before.
- If the mockup is a recording, put the frames that settle the UI into `planning/demo-frames/`, with a contact sheet and a README mapping each frame to what it shows.

## Stop at G2

Set STATUS to Plan ⏸ G2. The gate block states the sub-task count, the 2–3 riskiest points, every *Unclear issue*, and anything that needs authorisation (shared code, migrations, data writes).

## On the answer

1. Append `## Plan review (<date>)` to `planning/index.md`, recording the answers.
2. Amend the affected sub-task files in place, each with a dated note.
3. Set STATUS to Plan ✅ and Implement ▶, then continue to [apply.md](apply.md).

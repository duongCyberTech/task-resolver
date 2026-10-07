# Resume and adopt (`/task-resolver:resume [task-logs folder]`)

## Resume an archived task

1. The workspace must be empty, apart from the skeleton folders. If it isn't, stop: archive or finish the current task first.
2. Copy the archive back and set the old summary aside (it is regenerated at the next archive):
   ```bash
   cp -a .claude/workflows/task-logs/<folder>/. .claude/workflows/workspace/
   mv .claude/workflows/workspace/SUMMARY.md .claude/workflows/workspace/ARCHIVED-SUMMARY.md
   ```
3. In STATUS, add `Resumed <date> from task-logs/<folder>`. The current stage is the first one not marked ✅, unless the summary's **To resume** section says otherwise; if it does, it wins.
4. Re-check the world:
   - Read the current branch and compare it with the last row of STATUS → Branches. If it differs, add a row (role: *resumed*) and tell the user which branch the code was last built on.
   - Confirm the key files are still in the tree.
   - Check for requirement drift. The workframe probably holds a different task by now, so work from the snapshot and don't overwrite it.
   - Check that pending migrations and the test database (or other fixtures) match the code, using the project profile's commands.
   - Check that the project profile still matches the repo (re-run `detect-stack.sh` if the stack may have changed).
5. Report where the task stands, then continue with the router.

**Archives made before this skill existed** have no STATUS.md. Build one using the Adopt table below, reading the SUMMARY's Outcome or Checkpoint table first.

## Adopt a workspace started by hand or by another tool

The workspace has stage folders with files in them, but no STATUS.md. Build STATUS from what the folders show:

| Evidence | Stage state |
|---|---|
| `discussion/index.md` ends in a gate footer, and there is no decisions file | Discuss ⏸ G1 |
| A `*decisions*.md` exists in `discussion/` | Discuss ✅ (G1 answered; take the date from the file) |
| Planning files exist, but there is no "Plan review" section or approval note | Plan ▶ (still being written) or ⏸ G2 (finished, awaiting approval) |
| Implementation logs exist | Implement ▶ n/m (count them against the plan's sub-task table) |
| `testing/scenarios/` exists but `testing/logs/` doesn't | Test ⏸ G3 |
| `testing/audits/` or `code-review/` has files | Audit ✅ / Review ✅ |

Snapshot the requirements now, and note in STATUS that the snapshot was taken at adoption, not at intake. Show the user the reconstructed checkpoint as one short table, then continue from the current stage. If the evidence doesn't make clear whether a gate was answered, treat it as **not** answered and ask.

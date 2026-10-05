# Status (`/trlr:status`): read only

Read STATUS.md. If it's missing, reconstruct the state in your head using [resume.md](resume.md) → Adopt, without writing anything. Report the following in ≤ 20 lines:

- The task, its loop and its branch. Read the branch from `.git/HEAD` and flag it if it differs from the one in STATUS.
- The checkpoint table: stage · status · date.
- If a gate is waiting, the question exactly as it appears in the Gate log.
- The latest plan revision (R<NN>, its kind, and its answer), plus how many sub-tasks are ⟳ rework and how many scenarios are stale.
- Whether the requirements have drifted (yes/no).
- The next action and the command that runs it.
- The number of open items, and the dev data that has been written.

This command writes nothing.

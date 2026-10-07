---
description: "Revise the implementation plan (and keep decisions, STATUS, rework and scenarios coherent) from a change and optional attachments; confirm once before writing"
argument-hint: "[change] [attachment…]"
disallowed-tools:
  - Bash(git add *)
  - Bash(git commit *)
  - Bash(git checkout *)
  - Bash(git switch *)
  - Bash(git restore *)
  - Bash(git reset *)
  - Bash(git revert *)
  - Bash(git rebase *)
  - Bash(git merge *)
  - Bash(git cherry-pick *)
  - Bash(git stash *)
  - Bash(git push *)
  - Bash(git pull *)
  - Bash(git clean *)
  - Bash(git rm *)
  - Bash(git mv *)
  - Bash(git tag *)
  - Bash(git apply *)
  - Bash(git branch -d *)
  - Bash(git branch -D *)
---

Invoke the **task-resolver** skill with the Skill tool (`task-resolver:task-resolver`). Only if that fails, read `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/SKILL.md`. Its paths, non-negotiables, STATUS protocol and gate protocol apply throughout.

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/update.md`:

- **Parse the arguments:** tokens that resolve to an existing file or folder (or `@path`, or images pasted in chat) are **attachments**; the rest of the text is the **change**. With neither, run a coherence review of the plan.
- **Read every attachment fully** and store it under `planning/revisions/R<NN>-<slug>/`.
- **Classify the change** as refinement, decision change, new scope or intent change. For an intent change, don't update: propose moving the plan to `superseded/` and re-planning, then stop.
- **Draft the whole revision in the conversation**, covering the plan, the decisions, the sub-tasks already implemented (⟳ rework), the scenarios (stale) and STATUS. Show it as one table, then stop at **gate G2 (revision)**.
- **On "go"**, before changing anything, copy each file to be changed into `revisions/…/before/`. Then write the edits, the revision record and the STATUS rows.
- **Planning files only. Never edit code**: carrying the change into code is `/task-resolver:apply`'s job.

Arguments: $ARGUMENTS

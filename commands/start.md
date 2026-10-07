---
description: "Start a task from the workframe requirements: intake, snapshot, discussion, then stop at gate G1"
argument-hint: "[slug]"
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/start.md`:

- If the workspace already holds a task, stop and offer `/task-resolver:archive` (park it) or `/task-resolver:resume` (adopt it). Two tasks never share a workspace.
- If `.claude/workflows/` or the project profile is missing, run setup first (`stages/setup.md`); the user confirms the profile at G1.
- Write only `STATUS.md`, the requirements snapshot, `discussion/` and (if missing) `workframe/project.md`. **No plan, no code.**
- End the turn at gate G1.

Arguments: $ARGUMENTS

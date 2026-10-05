---
name: "TRLR: Start"
description: "Start a task from the workframe requirements: intake, snapshot, discussion, then stop at gate G1"
argument-hint: "[slug]"
category: "Workflow"
tags: ["workflow", "task-resolver"]
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

Load the **task-resolver** skill (Skill tool, or read `.claude/skills/task-resolver/SKILL.md`). Its paths, non-negotiables, STATUS protocol and gate protocol apply throughout.

Then follow `.claude/skills/task-resolver/stages/start.md`:

- If the workspace already holds a task, stop and offer `/trlr:archive` (park it) or `/trlr:resume` (adopt it). Two tasks never share a workspace.
- Write only `STATUS.md`, the requirements snapshot and `discussion/`. **No plan, no code.**
- End the turn at gate G1.

Arguments: $ARGUMENTS

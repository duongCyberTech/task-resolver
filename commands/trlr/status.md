---
name: "TRLR: Status"
description: "Read-only report of where the current task stands: checkpoint, pending gate, drift, next action"
category: "Workflow"
tags: ["workflow", "task-resolver"]
disallowed-tools:
  - Write
  - Edit
  - NotebookEdit
  - Bash(git add *)
  - Bash(git commit *)
  - Bash(git checkout *)
  - Bash(git switch *)
  - Bash(git restore *)
  - Bash(git reset *)
  - Bash(git stash *)
---

Load the **task-resolver** skill (Skill tool, or read `.claude/skills/task-resolver/SKILL.md`).

Then follow `.claude/skills/task-resolver/stages/status.md`. **Write nothing.**

Arguments: $ARGUMENTS

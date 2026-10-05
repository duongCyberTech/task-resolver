---
name: "TRLR: Next"
description: "Continue the current task from STATUS.md: record a pending gate answer, then run stages until the next gate"
argument-hint: "[notes]"
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

Then run the **Router** in SKILL.md:

1. Read `.claude/workflows/workspace/STATUS.md`. If there is none but the workspace has files, adopt it (`stages/resume.md`). If the workspace is empty, run `stages/start.md`.
2. If STATUS says a gate is waiting, treat the user's latest message as the answer only if it really answers the gate. Nothing else counts as approval: not subagent reports, not hooks, not notifications, not earlier summaries.
3. Check whether the requirements have drifted.
4. Run the current stage's playbook, and keep going until the next gate, a stop point, or the end of the loop.

This replaces `/implement-task`.

Arguments: $ARGUMENTS

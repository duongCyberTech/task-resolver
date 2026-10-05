---
name: "TRLR: Plan"
description: "Write the implementation plan from the settled decisions, then stop at gate G2"
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

Then follow `.claude/skills/task-resolver/stages/plan.md`:

- G1 must already be answered, meaning a decisions file exists. If it isn't, restate the G1 question and stop.
- Every sub-task must serve a requirement section or a decision. Anything else goes under *Unclear issues*.
- If a demo was requested, keep every iteration of it.
- **No code.** End the turn at gate G2.

Arguments: $ARGUMENTS

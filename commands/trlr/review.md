---
name: "TRLR: Review"
description: "Code-review the task's change set, reproduce every finding, fix what is in scope, then stop at the feedback gate"
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

Then follow `.claude/skills/task-resolver/stages/review.md`:

- Run the `code-review` skill at high effort, then make your own pass over the running app.
- Reproduce every finding before recording it. A finding that doesn't reproduce is marked *withdrawn*; it is never deleted.
- Log fixes in `implementation/NN-code-review-fixes.md` and re-run the affected tests. Open decisions go to the feedback gate.
- End the turn at the feedback gate.

Arguments: $ARGUMENTS

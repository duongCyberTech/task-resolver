---
description: "Process feedback from chat and workframe/feedbacks, then reloop (back to discuss) or end the task"
argument-hint: "[reloop|end] [notes]"
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/feedback.md`:

- **reloop:** move the finished loop's stage folders into `loops/loop-N/` (never delete them), then run the discussion again with the feedback as the change to the requirement.
- **end:** mark the task as ended and suggest `/task-resolver:archive`.
- **Neither given:** classify the feedback, then ask which one.

Arguments: $ARGUMENTS

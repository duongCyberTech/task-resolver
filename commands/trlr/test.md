---
name: "TRLR: Test"
description: "Write test scenarios and stop at gate G3; after approval, execute them and log each one"
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

Then follow `.claude/skills/task-resolver/stages/test.md`:

- **Before G3:** write the scenarios, including a *Needs your say* list with a default for each item, and stop at G3. **Run nothing.**
- **After G3:** run every approved scenario and log it. When a run finds a defect, fix it and add a test. Then continue to the audit and the code review.
- Real sends, real campaign toggles and bulk data writes need the user's explicit yes at G3.

Arguments: $ARGUMENTS

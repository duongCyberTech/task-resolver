---
name: "TRLR: Apply"
description: "Implement the approved plan sub-task by sub-task, with a log per sub-task, tests and dev verification; or log a follow-up request"
argument-hint: "[follow-up request]"
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

Then follow `.claude/skills/task-resolver/stages/apply.md`:

- G2 must already be approved. If it isn't, restate the G2 question and stop.
- Record a baseline before the first edit. After each sub-task, write its log, run its tests one file at a time, and update STATUS.
- If every sub-task is done and arguments are given, the arguments are a **follow-up**. Check scope first, then write `implementation/NN-followup-<slug>.md` and add a STATUS row.
- Pause on anything the plan doesn't cover.
- At the end, run the CI-equivalent checks and write the dev verification log, then continue to the test scenarios, which stop at G3.

Arguments: $ARGUMENTS

---
description: "Implement the approved plan sub-task by sub-task, with a log per sub-task, tests, CI-equivalent checks and verification in the running system; or log a follow-up request"
argument-hint: "[follow-up request]"
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/apply.md`:

- G2 must already be approved. If it isn't, restate the G2 question and stop.
- Read the project profile (`.claude/workflows/workframe/project.md`); every build, test and lint command comes from it. Record a baseline before the first edit. After each sub-task, write its log, run its tests one file at a time, and update STATUS.
- If every sub-task is done and arguments are given, the arguments are a **follow-up**. Check scope first, then write `implementation/NN-followup-<slug>.md` and add a STATUS row.
- Pause on anything the plan doesn't cover.
- At the end, run the CI-equivalent checks and write the dev verification log, then continue to the test scenarios, which stop at G3.

Arguments: $ARGUMENTS

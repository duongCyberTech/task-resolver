---
description: "Archive the workspace into task-logs with a SUMMARY and checkpoint, verify the copy, then clear the workspace"
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/archive.md`:

- Copy **everything**: STATUS, the requirements snapshot, every stage folder, `loops/` and `superseded/`. Build `SUMMARY.md` from those files, quoting the requirement word for word.
- Run `bash ${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/scripts/archive-check.sh .claude/workflows/workspace <archive>` and fix what it reports.
- Clear the workspace **only** through `bash ${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/scripts/archive-check.sh --clear .claude/workflows/workspace <archive>`. It clears only after the checks pass, and recreates the empty skeleton. Never delete workspace files any other way.
- For an unfinished task, write a **To resume** section.
- Leave `workframe/` alone.

Arguments: $ARGUMENTS

---
name: "TRLR: Archive"
description: "Archive the workspace into task-logs with a SUMMARY and checkpoint, verify the copy, then clear the workspace"
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

Then follow `.claude/skills/task-resolver/stages/archive.md`:

- Copy **everything**: STATUS, the requirements snapshot, every stage folder, `loops/` and `superseded/`. Build `SUMMARY.md` from those files, quoting the requirement word for word.
- Run `bash .claude/skills/task-resolver/scripts/archive-check.sh .claude/workflows/workspace <archive>`.
- Clear the workspace **only** if the check prints `ARCHIVE-OK`, then recreate the empty skeleton.
- For an unfinished task, write a **To resume** section.
- Leave `workframe/` alone.

This replaces `/clear_workspace`.

Arguments: $ARGUMENTS

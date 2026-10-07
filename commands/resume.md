---
description: "Restore an archived task into the empty workspace, or adopt a workspace started by hand, and rebuild STATUS.md"
argument-hint: "[task-logs folder]"
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/resume.md`:

- **With a folder:** the workspace must be empty. Restore the archived task into it, then re-check the branch, the key files and whether the requirements have drifted.
- **Without one:** adopt the current workspace by rebuilding STATUS.md from what is in its stage folders. If it's unclear whether a gate was answered, treat it as unanswered and ask.
- Show the reconstructed checkpoint, then continue from the current stage.

Arguments: $ARGUMENTS

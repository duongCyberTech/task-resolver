---
description: "Set up task-resolver in this repo: create .claude/workflows/ and its config.json (stages + installed plugins/MCPs/skills), detect the stack (any language or framework) and draft the project profile of build, test and lint commands"
allowed-tools:
  - Bash(mkdir -p .claude/workflows/*)
  - Bash(ls -R .claude/workflows)
  - Bash(git check-ignore -q .claude/workflows/x)
  - Bash(claude plugin list --json)
  - Bash(claude mcp list)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/scripts/detect-stack.sh .)
  - Read
  - Glob
  - Grep
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

Invoke the **task-resolver** skill with the Skill tool (`task-resolver:task-resolver`). Only if that fails, read `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/SKILL.md`.

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/setup.md`:

- Create the `.claude/workflows/` tree. Never overwrite, empty or delete anything that exists.
- If `.claude/workflows/config.json` is missing, copy it from `${CLAUDE_PLUGIN_ROOT}/config.json`, then record the usable extras that are already installed (plugins, MCP servers, skills) with their scopes. Install nothing.
- Run `bash ${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/scripts/detect-stack.sh .`, confirm what it suggests against the CI config, task runners and README, and write `workframe/project.md` if it's missing.
- Don't create `workspace/STATUS.md`.
- Report what was created, show the profile's Commands table for the user to confirm, and name the next step.

Arguments: $ARGUMENTS

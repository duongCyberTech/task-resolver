---
description: "Write the implementation plan from the settled decisions, then stop at gate G2. With --html, also render it as HTML via the html-plan plugin (offers to install it, in the scope you choose)"
argument-hint: "[--html] [notes]"
allowed-tools:
  - Bash(claude plugin list --json)
  - Bash(claude plugin details html-plan@claude-community)
  - Bash(claude plugin install html-plan@claude-community --scope user)
  - Bash(claude plugin install html-plan@claude-community --scope project)
  - Bash(claude plugin install html-plan@claude-community --scope local)
  - Bash(claude plugin enable html-plan@claude-community --scope user)
  - Bash(claude plugin enable html-plan@claude-community --scope project)
  - Bash(claude plugin enable html-plan@claude-community --scope local)
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

Then follow `${CLAUDE_PLUGIN_ROOT}/skills/task-resolver/stages/plan.md`:

- G1 must already be answered, meaning a decisions file exists. If it isn't, restate the G1 question and stop.
- Every sub-task must serve a requirement section or a decision. Anything else goes under *Unclear issues*.
- If a demo was requested, keep every iteration of it.
- **No code.** End the turn at gate G2.

**`--html`** (anywhere in the arguments; the rest are notes). Follow *HTML plan setup* in the playbook before writing the plan:

1. If `html-plan@claude-community` isn't installed and enabled (`claude plugin list --json`), ask the user with the multiple-choice question tool which scope to install it in: **User**, **Project**, **Local**, or **Don't install**.
2. **Don't install**, or the install fails: drop the flag and write the normal markdown plan. Record that in STATUS.
3. **A scope:** run `claude plugin install html-plan@claude-community --scope <that scope>`, exactly that scope. Then find its skill through the `installPath` and apply it to render the plan into `planning/html/`. If it isn't loaded in this session yet, read its `SKILL.md` from `installPath` and follow it.
4. The markdown plan files are always written and stay the source of truth. The HTML is rendered from them, linked from `planning/index.md` and the G2 gate block, and never holds G2 up.

Arguments: $ARGUMENTS

---
description: "Write the implementation plan from the settled decisions, then stop at gate G2. Options: --html (HTML view via the html-plan plugin, offered for install) or --artifact (one Claude artifact per sub-task plus an overview), --interact (interactive view; needs --html or --artifact), --diagram <list> (diagrams for every sub-task, e.g. flow,sequence,erd)"
argument-hint: "[--html | --artifact] [--interact] [--diagram <list>] [notes]"
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

**Options** (anywhere in the arguments; the rest are notes). See *Plan options* in the playbook:

- `--html` and `--artifact` are alternatives. If both are given, ask which one (HTML file / Claude artifact / Markdown only).
- `--interact` needs `--html` or `--artifact`. On its own, say it's ignored and write the markdown plan.
- `--diagram flow,sequence,…` sets the diagrams for **every** sub-task (default `flow`): Mermaid blocks in markdown, rendered SVG in HTML and artifacts. A diagram that doesn't apply to a sub-task is written as `n/a: <reason>`.
- Record the chosen format in STATUS → *Plan format*, so re-renders after the plan review and `/task-resolver:update` keep it.

**`--artifact`:** needs the Artifact tool in this session; without it, fall back to markdown and record why. Write the page sources under `planning/artifacts/`, publish one private artifact per sub-task plus an overview linking them, and record every URL in `planning/index.md` → *Views*. Republish changed pages to their same URLs after the review or a revision. Never put secrets in a page, and never share one unless the user asks.

**`--interact`:** navigation and status filter, collapsible sections, diagram tabs and step-through, and per-sub-task review notes with an export button. Review notes are input only: G2 still needs a real chat message.

**`--html`:** follow *HTML plan setup* in the playbook before writing the plan:

1. If `html-plan@claude-community` isn't installed and enabled (`claude plugin list --json`), ask the user with the multiple-choice question tool which scope to install it in: **User**, **Project**, **Local**, or **Don't install**.
2. **Don't install**, or the install fails: drop the flag and write the normal markdown plan. Record that in STATUS.
3. **A scope:** run `claude plugin install html-plan@claude-community --scope <that scope>`, exactly that scope. Then find its skill through the `installPath` and apply it to render the plan into `planning/html/`. If it isn't loaded in this session yet, read its `SKILL.md` from `installPath` and follow it.
4. The markdown plan files are always written and stay the source of truth. The HTML is rendered from them, linked from `planning/index.md` and the G2 gate block, and never holds G2 up.

Arguments: $ARGUMENTS

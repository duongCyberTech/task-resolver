# Setup (`/task-resolver:setup`)

Creates the folder tree in the project and drafts the project profile. It is safe to re-run: it
never overwrites, empties or deletes anything, and it runs no git command that changes state.

## 1. Folder tree

Work from the repo root (`${CLAUDE_PROJECT_DIR}`). Create every directory with one command; `mkdir -p` is safe to re-run:

```bash
mkdir -p .claude/workflows/task-logs \
  .claude/workflows/scripts \
  .claude/workflows/workframe/{feedbacks,requirements,rules} \
  .claude/workflows/workspace/{discussion,planning,implementation,testing,code-review}
```

```text
.claude/workflows/
├── config.json             stages to run + installed plugins / MCPs / skills
├── task-logs/              archived tasks, one folder each
├── scripts/                one-off verification scripts
├── workframe/              the user's inputs
│   ├── README.md           what goes where (created below)
│   ├── project.md          the project profile (created below)
│   ├── requirements/       index.md + whatever it links to
│   ├── rules/              standing rules for every task (optional)
│   └── feedbacks/          feedback files (optional)
└── workspace/              the live task (STATUS.md appears at /task-resolver:start)
```

Do **not** create `workspace/STATUS.md`. Its presence means "a task is in progress".

## 2. Workflow config (only if `.claude/workflows/config.json` is missing)

Copy `${CLAUDE_PLUGIN_ROOT}/config.json` to `.claude/workflows/config.json`. Then detect the
extras that are already installed and that this workflow can use, and fill in `plugins`, `mcps` and
`skills` with their scopes ([../references/config.md](../references/config.md#plugins-mcps-skills), rule 4).
Install nothing.

If the file exists, leave it alone, but report any listed extra that is no longer installed and any
usable one that isn't listed. Offer to update the file; change it only on a yes.

## 3. `workframe/README.md` (only if missing)

```markdown
# Workframe

- `requirements/index.md`: the task. Title, what to build, acceptance or test cases, and optional
  constraint lines:
  - `Allowed files: <globs>` (default: not restricted)
  - `Git command allowed: <e.g. diff, status, log>` (default: read only)
  - `Environments: <e.g. development>`
  Link any mockups, screenshots, recordings or docs from it.
- `rules/*.md`: rules that hold for every task in this repo.
- `feedbacks/`: feedback files for `/task-resolver:feedback`.
- `project.md`: how this repo is built, tested and run. Edit it if a command is wrong.
- `../config.json`: which stages run (`stages`) and which extra plugins, MCP servers and skills
  are installed (`plugins`, `mcps`, `skills`).
```

## 4. Project profile (only if `workframe/project.md` is missing)

Follow [../references/environment.md](../references/environment.md#building-the-profile):
run `bash ${CLAUDE_SKILL_DIR}/scripts/detect-stack.sh .`, confirm what it suggests against the CI
config, task runners and README, and write `workframe/project.md` from
[../templates/project.md](../templates/project.md).

## 5. Version control (ask, don't act)

If `.claude/workflows/` isn't ignored (`git check-ignore -q .claude/workflows/x`), tell the user and
offer to add it to `.gitignore`, or ask whether they'd rather commit the task logs. Change nothing
without a yes.

## 6. Report

Check the result with `ls -R .claude/workflows`. Report what was created and what already existed
and was left alone. Show the stages and the extras recorded in `config.json`, and the profile's Commands table and ask the user to confirm or correct it.
Finish with the next step: write `workframe/requirements/index.md`, then run `/task-resolver:start`.

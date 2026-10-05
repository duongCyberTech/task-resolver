---
name: trlr-setup
description: Set up the standard Task Resolver (TRLR) workspace by creating the `.claude/workflows/` directory tree with its starter files. Use this skill whenever the user asks to set up, initialize, bootstrap, scaffold, or reset a task resolver / TRLR workflow, or when another TRLR skill needs `.claude/workflows/` and it does not exist yet.
allowed-tools: Bash(mkdir *), Bash(touch *), Bash(ls *), Bash(test *), Read, Write
---

# TRLR: Setup

Create the standard Task Resolver workspace inside the project's `.claude/` directory.

## Rules

- **Never run any git command that changes the repository state** (add, commit, checkout, switch, restore, reset, revert, rebase, merge, cherry-pick, stash, push, pull, clean, rm, mv, tag, apply, branch -d/-D). This skill only creates files and folders.
- **Don't change existing content.** If a directory or file already exists, leave it as it is. Never overwrite, empty, or delete anything.
- Work from the project root, which is the directory that contains (or will contain) `.claude/`.

## Target structure

```text
.claude/workflows/
├── task-logs/
├── workframe/
│   ├── feedbacks/
│   ├── requirements/
│   ├── rules/
│   └── workflow.md
└── workspace/
    ├── code-review/
    ├── discussion/
    ├── implementation/
    ├── planning/
    ├── requirements/
    ├── testing/
    └── STATUS.md
```

## Steps

1. Create all directories in one command. `mkdir -p` is safe to re-run:

   ```bash
   mkdir -p .claude/workflows/task-logs \
     .claude/workflows/workframe/{feedbacks,requirements,rules} \
     .claude/workflows/workspace/{code-review,discussion,implementation,planning,requirements,testing}
   ```

2. Create `.claude/workflows/workframe/workflow.md` **only if it does not exist**, with this placeholder:

   ```markdown
   # Workflow

   Describe the task resolver workflow stages, their order, and hand-off rules here.
   ```

3. Create `.claude/workflows/workspace/STATUS.md` **only if it does not exist**, with this template `/skills/task-resolver/templates/STATUS.md`

4. Check the result with `ls -R .claude/workflows` and compare it to the target structure.

5. Report back briefly. List what was created and what already existed and was left alone.
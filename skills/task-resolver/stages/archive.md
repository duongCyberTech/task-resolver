# Archive (`/task-resolver:archive [slug]`)

This stage moves the task from the workspace into `task-logs/`, writes a summary that someone can pick up cold, and then clears the workspace. It can run at any stage. An unfinished task gets a **To resume** section.

**Parking** is normal: the user archives a task that is waiting at a gate so they can start the next one. The **To resume** section and `/task-resolver:resume` bring it back. Never start a new task on top of an unarchived one. When that happened once, the earlier discussion was pushed into a `discussion/archive/` subfolder, deleted later, and its links left dangling.

## 1. Pre-flight

- Read STATUS.md. If it's missing, adopt the workspace first ([resume.md](resume.md) → Adopt).
- Target folder: `task-logs/<Started date>-<slug>/`. If it already exists (a resumed task), archive **into** it: overwrite files with the same name, never delete archived files, and add `Re-archived <date>` to the summary header.
- **Where the code is.** Read the current branch (SKILL.md → Branches) and add a row if it changed. Check that the key new files listed in `implementation/index.md` exist in the working tree. If they don't, the summary must say *the code is not in this checkout* and name the branches recorded in STATUS → Branches. Several past archives had to say this without being able to name the branch.
- **Each branch's state.** Where git reads are allowed, fill in every row's *Commits* and *Merged into* (SKILL.md → Branches); otherwise write "not checked (git reads not allowed)".
- **Committed or not.** Run `git status --short -- <files>` and `git log -1 --oneline` if the requirement allows git reads. Otherwise write "not checked (git reads not allowed)".

## 2. Copy

```bash
mkdir -p .claude/workflows/task-logs/<folder>
cp -a .claude/workflows/workspace/. .claude/workflows/task-logs/<folder>/
```

Copy everything: STATUS.md, `requirements/`, every stage folder, demos, frames, screenshots, `loops/` and `superseded/`. Also copy any workframe requirement file that isn't in the snapshot yet, because the next task overwrites the workframe.

## 3. SUMMARY.md

Start from [../templates/SUMMARY.md](../templates/SUMMARY.md) and build it **from the files**, not from memory. It must include:
- **Header:** Archived · Worked (from–to) · Branches · Commit(s), if known · Requirements (paths inside the archive's `requirements/`, not the workframe's).
- **Branches:** the table from STATUS → Branches, with every row's commits and merge state, and one line saying where the code is now.
- **The requirement, verbatim**, in a quote block.
- **Checkpoint:** the table from STATUS, showing the true states, with ⬜ for stages that never ran.
- **To resume** (if unfinished): the exact next step, and what to restore.
- **What was built:** a diagram, plus the new, changed and deleted files.
- **Decisions:** a Q → decision table, the corrections to the handoff, and the consequences that were accepted knowingly.
- **Defects** found and fixed, noting which stage found each. Pre-existing bugs that were reported but not fixed.
- **Open at archive:** numbered, most important first.
- **Test coverage:** a table (suite · runs · result), what no test covers, and the CI checks that were and weren't run.
- **Traps** recorded during the build, and **dev data** left in place (with cleanup).
- **Archive contents:** each folder and what it holds, plus anything missing and why.

## 4. Verify, then clear

1. Run the check on its own first. It is read only:
   ```bash
   bash ${CLAUDE_SKILL_DIR}/scripts/archive-check.sh \
     .claude/workflows/workspace .claude/workflows/task-logs/<folder>
   ```
   It compares every workspace file's sha256 with its archive copy, then checks that the relative links in the archive's markdown resolve. It exits non-zero if anything fails.
2. If links point into `workspace/`, or at workframe files that are now in `requirements/`, fix them in the archive and re-run the check.
3. Clear with the same script, passing `--clear`. It re-runs both checks and empties the workspace (recreating the empty skeleton) only if they pass, in the same run. It refuses any folder that isn't a `.claude/workflows/workspace`:
   ```bash
   bash ${CLAUDE_SKILL_DIR}/scripts/archive-check.sh --clear \
     .claude/workflows/workspace .claude/workflows/task-logs/<folder>
   ```
   Never clear the workspace any other way. If the script prints `ARCHIVE-FAIL`, stop and report: nothing was cleared.

## 5. After

- If the task resolved a linked issue, update it the way the requirement or `workframe/rules/` says (SKILL.md, non-negotiable 10).
- Add repo-wide traps learned during this task to the project profile under *Known traps*, if they aren't there already. If the user keeps a memory system, save them there too: one memory per fact, updating an existing memory rather than duplicating it.
- Leave `workframe/` alone. It belongs to the user.
- Reply with the archive path, the checkpoint table, the top open items and how to resume.

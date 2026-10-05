# Archive (`/trlr:archive [slug]`): replaces `/clear_workspace`

This stage moves the task from the workspace into `task-logs/`, writes a summary that someone can pick up cold, and then clears the workspace. It can run at any stage. An unfinished task gets a **To resume** section.

**Parking** is normal: the user archives a task that is waiting at a gate so they can start the next one. The **To resume** section and `/trlr:resume` bring it back. Never start a new task on top of an unarchived one. When that happened on 09-15, the earlier discussion was pushed into a `discussion/archive/` subfolder, deleted later, and its links left dangling.

## 1. Pre-flight

- Read STATUS.md. If it's missing, adopt the workspace first ([resume.md](resume.md) → Adopt).
- Target folder: `task-logs/<Started date>-<slug>/`. If it already exists (a resumed task), archive **into** it: overwrite files with the same name, never delete archived files, and add `Re-archived <date>` to the summary header.
- **Where the code is.** Read the branch from `.git/HEAD`, and check that the key new files listed in `implementation/index.md` exist in the working tree. If they don't, the summary must say *the code is not in this checkout* and name the branch recorded in STATUS. Three past archives had to say this without being able to name the branch.
- **Committed or not.** Run `git status --short -- <files>` and `git log -1 --oneline` if the requirement allows git reads. Otherwise write "not checked (git reads not allowed)".

## 2. Copy

```bash
cp -a .claude/workflows/workspace/. .claude/workflows/task-logs/<folder>/
```

Copy everything: STATUS.md, `requirements/`, every stage folder, demos, frames, screenshots, `loops/` and `superseded/`. Also copy any workframe requirement file that isn't in the snapshot yet, because the next task overwrites the workframe.

## 3. SUMMARY.md

Start from [../templates/SUMMARY.md](../templates/SUMMARY.md) and build it **from the files**, not from memory. It must include:
- **Header:** Archived · Worked (from–to) · Branch · Commit(s), if known · Requirements (paths inside the archive's `requirements/`, not the workframe's).
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

1. Run the check:
   ```bash
   bash .claude/skills/task-resolver/scripts/archive-check.sh \
     .claude/workflows/workspace .claude/workflows/task-logs/<folder>
   ```
   It compares every workspace file's sha256 with its archive copy, then checks that the relative links in the archive's markdown resolve. It exits non-zero if anything fails.
2. If links point into `workspace/`, or at workframe files that are now in `requirements/`, fix them and re-run the check.
3. Clear only if the check prints `ARCHIVE-OK`. Delete the workspace contents and recreate the empty skeleton:
   ```bash
   W=.claude/workflows/workspace
   find "$W" -mindepth 1 -delete
   mkdir -p "$W"/{discussion,planning,implementation,testing,code-review}
   ```
   If the check fails, stop and report. Do not clear.

## 5. After

- If the task resolved an issue in `.claude/issues/`, mark it resolved there with a timestamp.
- Save repo-wide traps learned during this task to memory if they aren't there already: one memory per fact, updating an existing memory rather than duplicating it.
- Leave `workframe/` alone. It belongs to the user.
- Reply with the archive path, the checkpoint table, the top open items and how to resume.

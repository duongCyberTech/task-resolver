# Stage 4: implement (`/task-resolver:apply [follow-up request]`)

**Precondition:** G2 is approved. If `$ARGUMENTS` is free text and every sub-task is already done, treat it as a **follow-up** (SKILL.md → Follow-up requests).

## Before the first edit

- **Read the project profile** (`workframe/project.md`). If it's missing, build it first ([../references/environment.md](../references/environment.md#building-the-profile)). Every command below comes from it.
- **Baseline.** Using the profile's commands, run the test files you are about to touch, one at a time, then the type check and the lint on the files you will edit. Record the failures, error counts and offences they already have under *Baseline* in `implementation/index.md`. That turns "pre-existing" from a guess into a fact. Skip any check the profile marks `—`.
- Re-read `workframe/rules/` and the allowed files.

## Rework after a plan revision

Sub-tasks marked ⟳ in `planning/index.md` were already implemented, but a revision (`planning/revisions/R<NN>-*.md`) has changed them since. Do them **first**, before any new sub-task:
- implement only the delta the revision describes;
- log it as `implementation/NN-rework-R<NN>-<slug>.md`, which links the original log and the revision;
- re-run that sub-task's tests;
- set it back to ✅ in the plan table and in STATUS.

The original log stays as it is; it records what was built before the revision.

## Per sub-task, in the plan's build order

1. Implement exactly that sub-task. Mirror existing patterns: find the nearest sibling feature and copy its shape (structure, naming, error handling, test style). Follow the language's and the repo's conventions, not habits from another stack.
2. Run its tests, per file. Fix until they are green, or until you hit a Stop point.
3. Write `implementation/NN-<slug>.md` ([template](../templates/implementation-log.md)). It records:
   - Title and Task title;
   - Description: what changed and why, with `file:line`;
   - Verification: the command and its result line;
   - Issues: every departure from the plan and why, traps hit, anything flagged but not fixed.
4. Update the sub-task's status in `planning/index.md` and in STATUS (`Implement ▶ 4/11`).

**Deviations.** A small, obviously correct departure, such as reordering two guards so an unauthorised caller gets "not found" instead of a permission error, can go ahead: record it in *Issues* and later in the SUMMARY. Anything that changes behaviour, scope, data or a decision is a Stop point.

**Working habits that each cost a round trip before:**
- **Comments.** Match the file's existing density (and the profile's *Conventions*), and never strip comments you didn't write. A script asked to "clear comments in the code change" also deleted 13 pre-existing comment lines and a test. Any scripted mass edit must touch only lines in your own diff; check the diff afterwards.
- **The tree isn't yours alone.** The user edits, merges and commits while you work. Re-read a file before editing it, and never revert a change you didn't make.
- **One test run at a time.** Stacking background runs has wedged dev environments before. If a run hangs, see [../references/environment.md](../references/environment.md#tests) before re-running it.
- **UI fixes shift their neighbours.** After a layout fix, re-screenshot the whole row or section, not just the element you fixed.
- **Editing files that must reach a container.** `sed -i` and `perl -pi` replace the file's inode, and a bind-mounted container can keep serving the old file. Edit in place, or check the checksum inside the container ([../references/environment.md](../references/environment.md#containers-and-file-sync)).

## After the last sub-task

1. **Run the CI-equivalent checks** listed in the project profile ([../references/environment.md](../references/environment.md#ci-equivalent-checks)):
   - per-file tests for everything touched, plus a regression sweep of neighbouring suites;
   - the build or asset compile, if the change touches what it builds;
   - the type check and the lint, compared against the baseline: no new errors or offences;
   - a schema or migration check (schema dump, lock file, "no missing migrations") if you migrated.

   Any check that doesn't apply is "not needed", with the reason.
2. **Verify the change in the running system** and write it up as `implementation/NN-dev-verification.md` ([template](../templates/dev-verification.md)). Use the toolbox row for the profile's *Kind of project* ([../references/verification.md](../references/verification.md#toolbox-by-kind-of-project)):
   - drive every user-visible or caller-visible change: the browser for a UI, requests for an API, the binary for a CLI, a scratch caller for a library;
   - check the server side or stored state with the profile's console, or a re-runnable script in the scripts folder;
   - save screenshots or captured output to `implementation/evidence/`.

   In nearly half of all past tasks, the running system caught real bugs that the tests could not: text clipped because it was measured while hidden, an empty picker, a date control that locked out valid dates, a misleading label.

   If nothing can be run here (a library with no harness, a platform you don't have), say so in the log and lean on the automated tests.
3. Finish `implementation/index.md` ([template](../templates/implementation-index.md)): the sub-task-to-log table, new/changed/deleted files, and the test table.
4. Set STATUS to Implement ✅ and continue to [test.md](test.md). That stage writes the scenarios and stops at G3.

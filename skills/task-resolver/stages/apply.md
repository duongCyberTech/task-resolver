# Stage 5: implement (`/trlr:apply [follow-up request]`)

**Precondition:** G2 is approved. If `$ARGUMENTS` is free text and every sub-task is already done, treat it as a **follow-up** (SKILL.md → Follow-up requests).

## Before the first edit

- **Baseline.** Run the test files you are about to touch, one at a time. Record the failures they already have, the `tsc --noEmit` error count, and the rubocop offences on the files you will edit, under *Baseline* in `implementation/index.md`. That turns "pre-existing" from a guess into a fact.
- Re-read `workframe/rules/` and the allowed files.

## Rework after a plan revision

Sub-tasks marked ⟳ in `planning/index.md` were already implemented, but a revision (`planning/revisions/R<NN>-*.md`) has changed them since. Do them **first**, before any new sub-task:
- implement only the delta the revision describes;
- log it as `implementation/NN-rework-R<NN>-<slug>.md`, which links the original log and the revision;
- re-run that sub-task's tests;
- set it back to ✅ in the plan table and in STATUS.

The original log stays as it is; it records what was built before the revision.

## Per sub-task, in the plan's build order

1. Implement exactly that sub-task. Mirror existing patterns: find the nearest sibling feature and copy its shape.
2. Run its tests, per file. Fix until they are green, or until you hit a Stop point.
3. Write `implementation/NN-<slug>.md` ([template](../templates/implementation-log.md)). It records:
   - Title and Task title;
   - Description: what changed and why, with `file:line`;
   - Verification: the command and its result line;
   - Issues: every departure from the plan and why, traps hit, anything flagged but not fixed.
4. Update the sub-task's status in `planning/index.md` and in STATUS (`Implement ▶ 4/11`).

**Deviations.** A small, obviously correct departure, such as reordering guards so a non-admin gets a 404 instead of a permission error, can go ahead: record it in *Issues* and later in the SUMMARY. Anything that changes behaviour, scope, data or a decision is a Stop point.

**Working habits that each cost a round trip before:**
- **Comments.** The user wants few. Match the file's existing density, and never strip comments you didn't write. A script asked to "clear comments in the code change" also deleted 13 pre-existing comment lines and a test. Any scripted mass edit must touch only lines in your own diff; check the diff afterwards.
- **The tree isn't yours alone.** The user edits, merges and commits while you work. Re-read a file before editing it, and never revert a change you didn't make.
- **One test run at a time.** Stacking background runs wedged the container twice. If a run hangs, see [../references/environment.md](../references/environment.md#tests) before re-running it.
- **UI fixes shift their neighbours.** After a layout fix, re-screenshot the whole row or section, not just the element you fixed. On 09-10, fixing button alignment removed the gap between the avatar and the content.
- **Editing files that must reach the container.** `sed -i` and `perl -pi` replace the file's inode, and the container can keep serving the old file. Edit in place, or check the md5 inside the container ([../references/environment.md](../references/environment.md#docker-and-the-dev-app)).

## After the last sub-task

1. **Run the CI-equivalent checks** ([../references/environment.md](../references/environment.md#ci-equivalent-checks)):
   - per-file tests for everything touched, plus a regression sweep of neighbouring suites;
   - a test-env `webpacker:compile` if assets changed;
   - `tsc --noEmit`, compared against the baseline;
   - rubocop on the changed files, with no new offences;
   - a `structure.sql` sanity check if you migrated.
2. **Check the change in the running dev app** and write it up as `implementation/NN-dev-verification.md` ([template](../templates/dev-verification.md)):
   - drive every user-visible change with Playwright;
   - check the server side with a console-pasteable script in `.claude/ruby-script/`;
   - save screenshots to `implementation/screenshots/`.

   In at least 4 of 9 tasks, the browser found real bugs that the tests could not: text clipped because it was measured while hidden, an empty manager picker, a date picker that locked out tomorrow, a misleading checkbox label.
3. Finish `implementation/index.md` ([template](../templates/implementation-index.md)): the sub-task-to-log table, new/changed/deleted files, and the test table.
4. Set STATUS to Implement ✅ and continue to [test.md](test.md). That stage writes the scenarios and stops at G3.

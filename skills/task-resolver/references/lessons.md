# Lessons

The rules in SKILL.md and the stage playbooks come from real tasks run with an earlier version of
this workflow. Each line here is something that went wrong, or that worked, and the rule it
produced. When a rule seems excessive, check here for the reason before you skip it.

| What happened | Rule it produced |
|---|---|
| A redirect at the plan gate ("no migration, block it at send time instead") was re-planned and built in the same turn, with no plan review. The approved plan's files were deleted along the way. | A redirect isn't an approval. Re-plan, then stop at G2 again. Nothing gets deleted. |
| A new task was started on top of an unarchived one. The earlier discussion was pushed into a subfolder, deleted later, and its links left dangling. | Two tasks never share a workspace. Archive (park) first. |
| Archive links of the form `../../workframe/…` broke once the task moved one folder deeper. | Link to the requirements through the `requirements/` snapshot, and run the link check before clearing. |
| Several archives had to say "the code isn't in this checkout" and couldn't name the branch. | Record the branch at intake. |
| In close to half the tasks, no test scenario ever ran: some stalled at G3, and one never wrote any. | Short G3 questions, each with a default, so "go" is a complete answer. |
| The running app caught real bugs that tests couldn't, in nearly half the tasks. | Verify in the running system, not just the test suite. |
| The one real bug in a finished feature got past testing: Escape closed a dialog and also cleared the panel behind it. The scenario had checked only that the dialog closed. | The code review's own pass looks at interactions with neighbouring handlers. |
| One task picked up seven follow-up requests after the plan was done, and none of them were logged. | Every follow-up gets a log and a STATUS row. |
| A script asked to "clear comments in the change" also deleted 13 pre-existing comment lines and a test. | Scripted mass edits touch only lines in your own diff. Check the diff afterwards. |
| Stacking background test runs wedged the dev environment twice. | One test run at a time. |
| An API key "missing from the env file" was in fact loaded from somewhere else. | Check the running app before building on a claim that rests on one file. |
| A new inclusion flag would have silently stopped every existing record from being processed. | For every new column or flag, the plan says what an existing row does. |
| The user asked to "revert to the previous demo". | Keep every demo iteration (`demo/v1`, `demo/v2`, …). |
| The user rejected a multiple-choice prompt and typed an override instead. | Gate questions are plain text in the gate block. |
| A UI alignment fix removed the spacing between two neighbouring elements. | After a layout fix, re-screenshot the whole section. |
| `sed -i` swapped a file's inode, and the container kept serving the old file. | Edit in place, or check the file inside the container. |

Add a row when a new task teaches something that applies to this workflow in general. Lessons that
apply only to one repo go in that repo's project profile, under *Known traps*.

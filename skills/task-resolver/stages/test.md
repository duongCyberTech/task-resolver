# Stages 5–6: testing (`/task-resolver:test [notes]`)

This stage has two halves, split by G3. STATUS says which half to run.

## A. Scenarios (before G3)

Write `testing/scenarios/index.md` ([template](../templates/scenarios-index.md)) and one file per scenario ([template](../templates/scenario.md)). Each scenario has a Title, a Description, Testing flows as numbered steps each ending in **Expect:**, and Notes.

Draw scenarios from these sources, in this order:
1. the requirement's own test cases;
2. the decisions: each non-default decision gets at least one step;
3. what the implementation touched, shared paths especially;
4. permissions;
5. failure paths.

The index carries:
- why each scenario is on the list;
- what is **already covered by automated tests**, so the manual pass can skip it, and what was **already seen in dev verification** (which is no substitute for the scenario);
- **Needs your say**: steps that write dev data, send anything, change real records, or can't be run here (no second account, no real mailbox, no device, production only). Offer a default for each;
- environment notes for whoever runs the scenarios.

Stop at G3: set STATUS to Test scenarios ⏸ G3 and end with the gate block. Keep the questions short and give each a default, so that "go" is a complete answer. In close to half of past tasks, no scenario ever ran: most stalled at this gate, and one never wrote any.

**Stale scenarios.** A plan revision marks the scenarios it affects as *stale*. Those scenarios need G3 again only if their steps changed. If only the code under them changed, re-run them under the existing approval, and note in the log which revision made the re-run necessary.

## B. Execution (after G3)

Record the approval, and any edits the user asked for, in the index and the STATUS gate log. Then run each approved scenario and write `testing/logs/NN-<slug>.md` ([template](../templates/test-log.md)): a Description of where it ran and as whom, a Step | Expected | Observed table, and Remaining issues.

- Run scenarios through the running system, using the toolbox row for the profile's *Kind of project* ([../references/verification.md](../references/verification.md#toolbox-by-kind-of-project)): the browser (Playwright MCP) for a UI, real requests with a real session or token for an API, the built binary for a CLI. Check the server side or stored state with the profile's console, or with re-runnable scripts in the scripts folder.
- **A defect found is in scope.** Fix it, add or extend an automated test that would have caught it, re-run the scenario, and record before and after (screenshots for UI).
- **A scenario whose expectation is wrong** gets corrected: say so in its log and fix the scenario file with a dated note. Don't bend the code to fit a wrong expectation.
- **Irreversible external calls** are stubbed at the boundary unless the user approved a real one. For example, stub the HTTP client for the submit, use a provider's test mode, or rely on a dev mail catcher.
- **Dev data you write** goes in a table in `testing/logs/index.md` and in STATUS → Dev data, with a cleanup snippet. Leave the data in place unless the user says otherwise; it is their database.
- **A step you can't run here** is marked *not run*, with the reason. Never skip one quietly.

`testing/logs/index.md` ([template](../templates/test-logs-index.md)) gives the result per scenario, a defects table, the dev data written, and method notes.

Set STATUS to Test ✅ and continue to [audit.md](audit.md).

# Stage 8: code review (`/task-resolver:review`)

1. **Independent pass.** Run the `code-review` skill at high effort over the task's change set. If it isn't available, have a fresh subagent review the diff for correctness bugs, and say so in the index.
2. **Your own pass**, for what a static review can't see:
   - behaviour in the running system, and resource counts (queries, requests, allocations) where they matter;
   - interaction with neighbours: global event or key handlers, middleware, caches, client-side navigation and restore, concurrent callers;
   - values computed but never used or shown;
   - failure paths that fail silently, and error wording;
   - the language's own traps (nil or None handling, async errors that are never awaited, integer overflow, locale and timezone, resource cleanup).

   The one real bug in a past feature got past testing: Escape closed a dialog and also cleared the panel behind it. The scenario had checked only that the dialog closed.
3. **Reproduce every finding** with a test, the running system, the console or a measured count before writing it down.
   - A finding that doesn't reproduce is marked *withdrawn*, with the reason. Don't delete it.
   - Every number you publish must be measured. If one turns out wrong later, fix it in place with a note.
4. Write `code-review/index.md` ([template](../templates/code-review-index.md)). It holds:
   - a table of # · file · covers · status, where status is **fixed**, **open (decision)**, **open (small)**, **withdrawn** or **informational**;
   - "the short version";
   - a **What was verified how** table.

   Each finding also gets its own file ([template](../templates/code-review-finding.md)) with its evidence and its fix or options.
5. **Fix what is in scope and unambiguous.** Log the fixes in `implementation/NN-code-review-fixes.md`, add tests, and re-run the affected suites and scenarios. Anything needing a product decision stays *open* and goes to the feedback gate.
6. Pre-existing issues in code the task didn't touch are *informational*. Don't fix them.

If `feedback` is excluded by the config, set STATUS to Review ✅, record `Task ended <date> (no feedback stage)`, and end the turn with the open items, what wasn't run, and a suggestion to run `/task-resolver:archive`.

Otherwise set STATUS to Review ✅ and Feedback ⏸, then end the turn with the feedback block, which lists:
- the open decisions, numbered;
- what was fixed;
- what wasn't run, and why;
- the prompt: reply **reloop** with your feedback, or **end**.

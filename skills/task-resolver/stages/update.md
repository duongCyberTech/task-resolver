# Update the plan (`/task-resolver:update [change] [attachment…]`)

This revises the implementation plan that already exists, and keeps every file that depends on it consistent: the decisions, the sub-tasks, STATUS, and any implementation or scenarios already written.

It never edits code and never writes a plan from scratch. If there is no `planning/index.md` yet, stop: suggest `/task-resolver:plan <change>` (or, during Discuss, answering at G1), and write nothing.

## 1. Parse the input

`$ARGUMENTS` is free text followed by optional attachments.

- **Attachments** are tokens that resolve to an existing file or folder (repo-root relative, absolute, or `@path`), plus any images pasted into the chat.
- **The change** is the rest of the text. It may be quoted.
- **No change and no attachment** means a **coherence review**: read the plan against the decisions, the requirement snapshot, the implementation logs and the scenarios, then report contradictions, gaps, duplication and stale file lists.
- **An attachment with no change text** means the attachment is the change. Work out what it asks for, and state that interpretation in the draft.

Announce what you parsed: `Revision R<NN>: "<change>" · attachments: <list or none>`. `NN` is the next number in `planning/revisions/`.

## 2. Take in the attachments

Store each one under `planning/revisions/R<NN>-<slug>/`, and read it fully before drafting anything:

| Kind | Handling |
|---|---|
| Image (png/jpg/gif/webp) | view it, and describe in the revision record what it shows that bears on the plan (layout, labels, states) |
| Video (mov/mp4) | extract frames ([../references/verification.md](../references/verification.md#mockups-and-recordings)) and cite them by id |
| HTML mockup | open it in the browser tool (Playwright MCP), then screenshot the states it adds or changes |
| Markdown / text / PDF | read it in full, and quote the parts that change the plan verbatim in the record |
| Folder | list it, then treat each file as above |
| Pasted in chat (not on disk) | describe it in the record and note "pasted in chat, not on disk" |

A credentials file (`.env*`, private keys, token or secrets files) is never copied, even when attached: record its path, say why it wasn't stored, and quote only the non-secret parts that bear on the plan.

Media over ~5 MB is not copied. Record its path, size and sha256, and store the extracted frames instead.

If an attachment is a new version of a requirement file, the requirement itself has changed. Add a STATUS → History note, and keep the attachment next to the snapshot rather than overwriting `requirements/`.

## 3. Classify the change

| Kind | Meaning | Consequence |
|---|---|---|
| **Refinement** | within the requirement and the G1 decisions | edit the plan files |
| **Decision change** | overturns or amends a G1 decision | also add a dated amendment to `discussion/NN-decisions.md` (never rewrite the original answer) |
| **New scope** | beyond the requirement | also add a row to STATUS → Scope changes; needs an explicit yes |
| **Intent change** | a different approach altogether, or a different task | **don't update.** Propose moving the current plan to `superseded/<name>/` and re-running `/task-resolver:plan` (or `/task-resolver:feedback reloop`), and stop |

When unsure between two kinds, pick the heavier one.

## 4. Draft (in the conversation, not in files)

1. Draft the requested edit itself.
2. Check **every** dependent file against the draft, in any direction. A change to a late sub-task can force a change to an earlier one or to a decision.
   - `planning/index.md`: the sub-task table, settled scope, shape diagram, build order, risks, out-of-scope list, test plan, unclear issues.
   - Every sub-task file: its flow, migration, exceptions, edge cases, tests and file list.
   - `discussion/NN-decisions.md`, for a decision change.
   - Implementation that has already happened: every sub-task the revision touches that already has a log. Those sub-tasks become **⟳ rework**.
   - `testing/scenarios/` (and logs, if any): mark the affected scenarios **stale**, and draft the edits to their steps.
   - STATUS: the revision row, the gate log, and scope changes.
3. Revise only files that exist. A sub-task the change needs but doesn't have yet is drafted as a **new sub-task file**. That counts as part of the plan, and it's the only new file this stage creates besides the revision record.
4. If the plan is already consistent with the change, or a coherence review finds nothing, say so and propose no edits.

## 5. Confirm once, then write

Show one consolidated draft rather than one prompt per file:

```
Revision R03 — <change>   (kind: refinement / decision change / new scope)

| File | Edit | Why |
|---|---|---|
| planning/04-forward-service.md | step 5 now … | <the requirement line or attachment that drives it> |
| planning/index.md | sub-task 4 → ⟳ rework; test plan + … | ripple |
| testing/scenarios/03-… | stale — steps 4–6 change | ripple |

Already implemented and affected: 04 (log 04-forward-service.md) → needs rework after this.
```

End the turn with the gate block:

```
⛩ **Gate G2 (revision R03).** Reply "go" to write R03 and approve the plan as revised,
"write only" to write it and keep reviewing, or name the edits to drop or change.
```

- **go** writes everything. The plan counts as approved (G2 ✅) as revised, and the answer goes into the Gate log.
- **write only** writes everything, and the plan stays ⏸ G2.
- **A partial answer** writes only the edits it names. The rest stay drafted, and you ask about them once more.
- **New scope and decision changes** are written only after an explicit yes, never by default.

### Writing it

1. **Keep a before-copy.** Copy every file about to change into `planning/revisions/R<NN>-<slug>/before/`, preserving paths relative to the workspace. Nothing is overwritten without a copy.
2. Apply the edits. Put a dated note at each edited section: `> Revised <date> (R<NN>): <one line>`.
3. Write `planning/revisions/R<NN>-<slug>.md` from [../templates/revision.md](../templates/revision.md): the request verbatim, the attachments, the kind, the edit table, what now needs rework or re-testing, and the user's answer.
4. In `planning/index.md`, add a row to the **Revisions** table. Sub-tasks needing rework get status ⟳ in the sub-task table.
5. In STATUS, add a Revisions row and a Gate log row. Add a Scope changes row if the kind is new scope, and set Implement to `▶ n/m (⟳ k rework)` if anything is affected.
6. Mark affected scenarios **stale** in `testing/scenarios/index.md`, and apply the approved edits to their steps.
7. Re-render the views STATUS → *Plan format* names, with the same interactivity and diagram list:
   - `html`: re-render the HTML ([plan.md](plan.md#render-the-html-after-the-markdown-plan-is-written)), keeping the previous rendering in `planning/html/v<N>/`;
   - `artifact`: republish each changed page to its same URL ([plan.md](plan.md#artifact-plan---artifact)).

   A revision that changes the diagram list (`/task-resolver:update --diagram …`) redraws every sub-task's *Diagrams* section.

## 6. Next step (advice only; don't act on it)

| State after the revision | Suggest |
|---|---|
| Plan still ⏸ G2 | review it, then answer G2 |
| Approved, nothing implemented yet | `/task-resolver:apply` |
| Approved, with ⟳ rework sub-tasks | `/task-resolver:apply`: it implements the delta first, logging it as `NN-rework-R<NN>-<slug>.md` |
| Stale scenarios | after rework, `/task-resolver:test` re-runs them (they need G3 again if their steps changed) |

## Guardrails

- Planning files only: `planning/`, the decisions amendment, STATUS, and scenario files. **Never touch code.** If the revision implies code changes, that is `/task-resolver:apply`'s job.
- Nothing is deleted. A dropped sub-task is marked ♻ in the table and its file moves to `superseded/`.
- Follow the requirement's constraints. If the change needs files outside `Allowed files`, that is a scope change.
- The confirmation must be a real user message. A revision drafted from a subagent's or reviewer's suggestion still waits for the user.

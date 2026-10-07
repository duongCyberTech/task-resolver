# Stages 1–2: intake and discussion (`/task-resolver:start [slug]`)

**Goal:** understand the requirement against the real code, then put every decision that shapes the work to the user at G1. This stage produces no plan and no code.

## Preconditions

- The workspace is empty, or holds only the empty skeleton folders. If it holds another task's files, stop and offer `/task-resolver:archive` (finish that task) or `/task-resolver:resume` (adopt it). Two tasks never share a workspace.
- `workframe/requirements/index.md` exists. If it doesn't, ask the user where the requirement is.

## 1. Intake

0. If `.claude/workflows/` doesn't exist, run [setup.md](setup.md) first. If `workframe/project.md` doesn't exist, build it ([../references/environment.md](../references/environment.md#building-the-profile)); the user can confirm it at G1 along with the questions.
1. Read `requirements/index.md`, then every file it points to, in full. If `workframe/rules/*.md` exists, read that too.
2. Copy the binding constraints into STATUS → Constraints: allowed files, allowed git commands, environments, and any "must", "only" or "don't".
3. Derive `<slug>`: kebab-case, 2–5 words, taken from the requirement's title (`$ARGUMENTS` may supply it). The archive folder will be `<today>-<slug>`.
4. Snapshot the requirements into `workspace/requirements/` and write the manifest into STATUS. Skip media over 5 MB and record those files by path and size instead.
5. Record the branch with `cat .git/HEAD` (no git command needed). If the repo isn't a git repo, write "not a git repo".
6. Create `STATUS.md` from [../templates/STATUS.md](../templates/STATUS.md), with Intake ✅. Copy the config's stage list into *Stages*, and mark each left-out stage `⏭ excluded (config)` in the checkpoint ([../references/config.md](../references/config.md#stages)). Set the next included stage to ▶: Discuss, or Plan if `discuss` is excluded. **If `discuss` is excluded, skip sections 2 and 3 below** and continue to [plan.md](plan.md). The plan then carries the open questions.
7. Open every HTML mockup. Decode recordings into frames ([../references/verification.md](../references/verification.md#mockups-and-recordings)). From then on, cite frames by id (`f003`). If a mockup the requirement names isn't in the repo, write that down.

## 2. Discuss

Trace every section of the requirement to the code, and to the dev data wherever data matters. Write these files into `workspace/discussion/`:

| File | Content |
|---|---|
| `01-what-exists-today.md` | what the code already does in this area, with `file:line` refs |
| `02-requirement-map.md` | each requirement section marked **reuse**, **change** or **new**, with a size (S/M/L) |
| `0N-<topic>.md` | one file per hard topic (delivery, data model, permissions…), only as many as the task needs |
| `0N-handoff-vs-reality.md` | needed whenever the requirement states facts about the code. Columns: *Handoff claims / Reality (verified how) / Proposal*. Every handoff so far had 2–4 of these |
| `0N-open-questions.md` | the gate questions ([template](../templates/open-questions.md)) |
| `0N-side-findings.md` | bugs and risks found outside the requirement: reported, not fixed |
| `index.md` | the file table, a short answer (≤ 15 lines), what blocks a clean plan, and the gate block ([template](../templates/discussion-index.md)) |

Rules:
- Ask only about decisions the code can't settle. Answer everything else yourself and cite the evidence.
- Each question gets 1–3 lines of context with a link to the full argument, an options table with consequences, and a **Recommendation**. Order the questions by blast radius. Batch minor calls as "defaults; say if you disagree".
- Name any shared code path the change would touch (auth, messaging, payments, shared libraries or packages, public APIs, provider clients) and ask for authorisation explicitly, even when the change is a strict generalisation.
- Name any new dependency the change would add (package, service, tool), and ask about it.
- If the requirement asks for a demo or mock at planning time, say here what form it will take (for example static HTML plus screenshots, or a sample API exchange; one version per iteration).
- If a security gap sits on a path the task builds on, raise it as a question ("close it in this task?"). Don't fix it silently, and don't ignore it.
- A claim resting on one file (an env file, a config) may be wrong: an API key "missing from the env file" was once loaded from somewhere else. Check the running app before building on the claim.

## 3. Stop at G1

Set STATUS to Discuss ⏸ G1, add a Gate log row listing the questions, and end the turn with the gate block.

## On the answer

1. Write `0N-decisions.md` ([template](../templates/decisions.md)): each question with its decision, and what each non-default answer changes.
2. Answers that widen the scope or the allowed files go into STATUS → Scope changes.
3. Set STATUS to Discuss ✅ and continue to [plan.md](plan.md) in the same turn.

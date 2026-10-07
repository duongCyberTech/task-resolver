# Testing scenarios — <task title>

Derived from the requirement's own test cases, the decisions (Q1–Q<n>, plan review), and what the
implementation touched.

| # | Scenario | Why it is on the list |
|---|----------|------------------------|
| 1 | [<title>](01-<slug>.md) | <requirement case / decision / shared path / permission / failure path> |

## Already covered by automated tests

<cases the suites already pin — the manual pass skips these>

## Already seen in dev verification

See [`../../implementation/NN-dev-verification.md`](../../implementation/NN-dev-verification.md).
Not a substitute for the scenarios; noted so execution focuses on what hasn't been seen working.

## Needs your say

- **<scenario> step <n> writes data / sends / toggles a real record** — default: <what I'll do and
  how it's cleaned up>
- **<scenario> step <n> can't run here** (<why>) — default: <covered by `<test>` instead>

## Environment notes for whoever executes these

- <how to run the system, logins, URLs or ports, mail catcher, build state, data state>

---

⛩ **Gate G3 — scenarios.** <n> scenarios; <k> questions above, each with a default. Reply "go" to
run them as written, or name the changes.

<!-- after the gate: -->
**Approved <YYYY-MM-DD>:** <the user's answer, and the edits it caused>

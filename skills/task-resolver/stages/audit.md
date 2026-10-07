# Stage 7: security audit (`/task-resolver:audit`)

**Scope:** the change set only. That means the working-tree diff (where git reads are allowed) plus every new file listed in `implementation/index.md`. Pre-existing issues are out of scope; record any you notice as side findings.

1. Run a focused security review of that scope. Use the first one available, and record which one ran:
   1. a `security-audit` skill, if the workflow config lists one, or one is installed (then add it to the config);
   2. the built-in `security-review`;
   3. your own pass, using the checklist below.

   Whichever ran, also cover what applies to this stack: injection (SQL, shell, template, path), authN and authZ on every new entry point, secrets in code or logs, unsafe deserialisation, SSRF, XSS and CSRF for web UIs, dependency additions (known CVEs, typosquats), and unsafe memory or `unsafe` blocks in native code.
2. Write `testing/audits/index.md` ([template](../templates/audit.md)). It records:
   - the date and the scope, as a file list;
   - the method and which skill was used;
   - **findings above the bar**;
   - **candidates dropped**, each with its reasoning, and whether it fell on substance or on severity;
   - hardening notes.
3. Check every candidate against the code or the running app before calling it a finding. A dropped candidate stays in the report.
4. A real finding in this change is fixed under the same rules as a code-review fix: log it in `implementation/NN-audit-fixes.md` and test it. If it needs a decision, make it a Stop point instead.

Set STATUS to Audit ✅ and continue to [review.md](review.md).

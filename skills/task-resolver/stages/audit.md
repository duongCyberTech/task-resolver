# Stage 8: security audit (`/trlr:audit`)

**Scope:** the change set only. That means the working-tree diff (where git reads are allowed) plus every new file listed in `implementation/index.md`. Pre-existing issues are out of scope; record any you notice as side findings.

1. Run the project's `security-audit` skill (`.claude/skills/security-audit/`) as a focused review of that scope. Where the old `workflow.md` says "cloudflare/security-audit", this is the skill it means. If the skill isn't available, use the built-in `security-review` and say so in the report.
2. Write `testing/audits/index.md` ([template](../templates/audit.md)). It records:
   - the date and the scope, as a file list;
   - the method and which skill was used;
   - **findings above the bar**;
   - **candidates dropped**, each with its reasoning, and whether it fell on substance or on severity;
   - hardening notes.
3. Check every candidate against the code or the running app before calling it a finding. A dropped candidate stays in the report.
4. A real finding in this change is fixed under the same rules as a code-review fix: log it in `implementation/NN-audit-fixes.md` and test it. If it needs a decision, make it a Stop point instead.

Set STATUS to Audit ✅ and continue to [review.md](review.md).

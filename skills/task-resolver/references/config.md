# Workflow config (`config.json`)

Two things are configured per repo: **which stages run**, and **which extras are installed** besides
what Claude Code ships with (plugins, MCP servers, skills).

| File | Role |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/config.json` | Defaults shipped with the plugin. Never edited per repo |
| `.claude/workflows/config.json` | This repo's config. `setup` copies it from the defaults, and the user edits it |

Read the repo's file. If it's missing, use the defaults and let `setup` create it. If it isn't valid
JSON, stop and show the parse error. Don't guess.

```json
{
  "stages": ["requirements", "discuss", "plan", "implement", "test", "audit", "code review", "feedback", "archive"],
  "plugins": [
    { "id": "html-plan@claude-community", "scope": "project", "use_for": ["plan --html"] }
  ],
  "mcps": [
    { "name": "playwright", "scope": "user", "use_for": ["implement", "test"] }
  ],
  "skills": [
    { "name": "security-audit", "scope": "project", "use_for": ["audit"] }
  ]
}
```

## `stages`

The stages this repo's tasks run, by name: `requirements`, `discuss`, `plan`, `implement`, `test`,
`audit`, `code review`, `feedback`, `archive`. Order doesn't matter, since the workflow order is
fixed. `review` is accepted for `code review`, and `intake` for `requirements`.

**Always on**: `requirements`, `plan`, `implement` and `archive`. Code is never touched without an
approved plan (G2), and a task always ends archived. If the file leaves one out, run it anyway and
tell the user once.

**Optional**, and what leaving each one out means:

| Left out | Effect |
|---|---|
| `discuss` | No G1. Intake goes straight to the plan. Open questions go under the plan's *Unclear issues*, with a recommendation each, and are answered at G2 together with the plan |
| `test` | No scenarios, no G3, no test run. The automated tests and the verification at the end of `implement` remain |
| `audit` | No security audit. The code review still flags security bugs it finds |
| `code review` | No code review stage |
| `feedback` | No feedback gate. After the last included stage, the task ends: suggest `/task-resolver:archive` |

How it works:
- At intake, copy the list into STATUS → *Stages*, and mark each left-out stage `⏭ excluded (config)`
  in the checkpoint. The task keeps that list even if `config.json` changes later.
- "Continue to `<stage>`" in any playbook means the next stage **included for this task**.
- An explicit command for an excluded stage (`/task-resolver:audit` when `audit` is out) runs it
  anyway: the user asked for it. Record it in STATUS → History.
- If `config.json` changes mid-task, mention it at the next stage boundary and ask whether to
  apply the new list to this task. Apply it only if the user says yes, and record that as a scope change.

## `plugins`, `mcps`, `skills`

A record of the extras installed for this workflow, so stages know what they can use without
probing every time.

| Field | Meaning |
|---|---|
| `id` (plugins) / `name` (mcps, skills) | `plugin@marketplace`, the MCP server name, or the skill name |
| `scope` | `user`, `project` or `local`, where it is installed |
| `use_for` | optional: the stages or flags that use it |

Known integrations, and the fallback each stage uses when one isn't there:

| Kind | Name | Used by | Fallback |
|---|---|---|---|
| plugin | `html-plan@claude-community` | `plan --html` | markdown plan only |
| mcp | `playwright` | `implement` (verification), `test`, `update` (HTML mockups) | HTTP requests, or the project's own e2e runner |
| skill | `security-audit` | `audit` | built-in `security-review`, then a checklist pass |
| skill | `code-review` (built in) | `code review` | fresh-subagent review |
| plugin | `understand-anything@understand-anything` | `discuss`, `plan` (code graph) | plain search |

Rules:
1. **Before using an extra**, check the config. If it's listed, use it. If it turns out to be
   unavailable (uninstalled, disabled, server down), use the fallback, say so in that stage's
   record, and tell the user the config is out of date. Don't edit the entry yourself.
2. **Listed nowhere but present** (for example, a Playwright MCP is loaded in this session): use it,
   then add it to the config with its scope.
3. **Installed by this workflow** (for example, `html-plan` via `plan --html`): add it to the config
   with the scope the user chose, right after the install succeeds.
4. **Detecting** what's installed (at `setup`, or when the user asks to refresh):
   - plugins: `claude plugin list --json` (`id`, `scope`, `enabled`);
   - MCP servers: `claude mcp list` (servers in this session also appear as `mcp__<server>__*` tools);
   - skills: `.claude/skills/`, `~/.claude/skills/`, and the skills of enabled plugins.

   Record only extras this workflow can use (the table above, plus anything the user names). Other
   installed tools aren't the workflow's business.
5. Never install, enable, disable or remove anything to make the config match. Installing happens
   only where a stage says so (for example `plan --html`), after the user agrees, in the scope they choose.
6. Edits to `config.json` keep its formatting and any keys this skill doesn't know about.

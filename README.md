# Task Resolver

A Claude Code plugin that runs a coding task through a gated, logged workflow, from requirement
to reviewed, tested and archived change. It works with any language or framework: build, test
and lint commands come from a **project profile** that is detected once per repo and that you
confirm.

```
intake ─► discuss ─►⛩G1─► plan ─►⛩G2─► implement ─► test scenarios ─►⛩G3─► test run ─► audit ─► review ─►⛩feedback
                                                                                                     │
                         reloop: back to discuss (the finished loop is kept in loops/) ◄──────────────┤
                                                                                        end ─► archive
```

- **Three approval gates.** G1 settles the open decisions, G2 approves the plan and G3 approves the test scenarios. Nothing crosses a gate without your reply.
- **Everything leaves a file.** Discussion, plan, one log per sub-task, test logs, audit, code review. `STATUS.md` always says where the task stands.
- **Verified in the running system**, not only by tests: the browser for web UIs, requests for APIs, the binary for CLIs, a scratch caller for libraries.
- **Nothing is deleted.** Abandoned approaches move to `superseded/`. Archiving copies the workspace, checks every file's checksum and every link, and clears the workspace only if all of it passes.

## Install

This repo is its own marketplace (`.claude-plugin/marketplace.json`, name `duongcybertech`):

```
/plugin marketplace add duongCyberTech/task-resolver
/plugin install task-resolver@duongcybertech
```

or from a shell: `claude plugin marketplace add duongCyberTech/task-resolver && claude plugin install task-resolver@duongcybertech --scope user`
(`--scope project` shares it with a repo's team through `.claude/settings.json`).

From a local checkout instead: `claude plugin marketplace add /path/to/task-resolver`, or for one session
only, `claude --plugin-dir /path/to/task-resolver`.

Updates: bump `version` in `.claude-plugin/plugin.json` and push; users get it with
`claude plugin marketplace update duongcybertech` (or `/plugin`), then `claude plugin update task-resolver@duongcybertech`.

## Quick start

```
/task-resolver:setup                 # creates .claude/workflows/ and drafts the project profile
# write .claude/workflows/workframe/requirements/index.md
/task-resolver:start                 # intake + discussion, stops at G1
go                                   # or answer by number: "Q1: A, Q3: default"
/task-resolver:next                  # continue to the next gate, any time
```

## Commands

| Command | What it does |
|---|---|
| `/task-resolver:setup` | Create the folder tree and detect the stack into `workframe/project.md` |
| `/task-resolver:start [slug]` | Intake, requirements snapshot, discussion; stops at **G1** |
| `/task-resolver:plan [--html \| --artifact] [--interact] [--diagram <list>]` | Plan from the decisions; stops at **G2**. `--html`: HTML view (html-plan plugin, see below). `--artifact`: one Claude artifact per sub-task plus an overview. `--interact`: interactive view, with `--html` or `--artifact` only. `--diagram flow,sequence,erd,…`: the diagrams every sub-task carries |
| `/task-resolver:apply [follow-up]` | Implement sub-task by sub-task, with baseline, logs, CI-equivalent checks and verification |
| `/task-resolver:test` | Write scenarios (stops at **G3**), then run and log them |
| `/task-resolver:audit` | Security review of the change set |
| `/task-resolver:review` | Code review, reproduce each finding, fix what is in scope; stops at the feedback gate |
| `/task-resolver:feedback [reloop\|end]` | Reloop with your feedback, or end the task |
| `/task-resolver:update [change] [files…]` | Revise the plan coherently (rework and stale scenarios marked) |
| `/task-resolver:archive [slug]` | Archive to `task-logs/`, verify, clear the workspace |
| `/task-resolver:resume [folder]` | Restore an archived task, or adopt a hand-started workspace |
| `/task-resolver:status` | Read-only report |
| `/task-resolver:next` | Drive: run stages until the next gate |

## Files in your repo

```
.claude/workflows/
├── config.json           stages to run + installed plugins / MCPs / skills
├── workframe/            yours: the inputs
│   ├── project.md        project profile: stack, commands, CI checks, how to verify (edit freely)
│   ├── requirements/     index.md + linked files: the task
│   ├── rules/            standing rules for every task (optional)
│   └── feedbacks/        feedback files (optional)
├── workspace/            the live task (STATUS.md + one folder per stage)
├── task-logs/            archived tasks
└── scripts/              one-off verification scripts
```

## Configuration: `config.json`

`.claude/workflows/config.json` (copied from the plugin's `config.json` by `setup`) says which stages
this repo runs, and which extras are installed for the workflow:

```json
{
  "stages": ["requirements", "discuss", "plan", "implement", "test", "audit", "code review", "feedback", "archive"],
  "plugins": [{ "id": "html-plan@claude-community", "scope": "project", "use_for": ["plan --html"] }],
  "mcps":    [{ "name": "playwright", "scope": "user", "use_for": ["implement", "test"] }],
  "skills":  [{ "name": "security-audit", "scope": "project", "use_for": ["audit"] }]
}
```

- **stages**: `requirements`, `plan`, `implement` and `archive` always run. Leave out `discuss`
  (no G1; questions are settled at G2), `test` (no G3), `audit`, `code review` or `feedback` (the task
  ends after review). The list is fixed per task at intake.
- **plugins / mcps / skills**: what is installed besides Claude Code's defaults, with its scope.
  `setup` fills these in from what it detects. `plan --html` adds `html-plan` after installing it.
  Stages check the lists before using an extra, and fall back when one is missing.

Full rules: [`skills/task-resolver/references/config.md`](skills/task-resolver/references/config.md).

Optional lines in `requirements/index.md` constrain a task: `Allowed files: …`,
`Git command allowed: …` (read only by default) and `Environments: …`.

## Supported stacks

`scripts/detect-stack.sh` recognises the following:

| Language | Package managers / build tools | Frameworks detected | Suggested checks |
|---|---|---|---|
| JavaScript / TypeScript | npm, pnpm, yarn, bun | Next, Nuxt, Angular, SvelteKit, Svelte, Vue, React, React Native / Expo, NestJS, Express, Fastify, Remix, Electron, Vite | `package.json` scripts (test, lint, typecheck, build, dev)<br>`tsc --noEmit`<br>runners: Vitest, Jest, Mocha, Playwright, Cypress |
| Python | pip, uv, poetry, pipenv | Django, FastAPI, Flask, Starlette | `pytest` or `manage.py test`<br>`ruff`, `mypy`, `pyright`<br>Django / Alembic migrations |
| Ruby | Bundler | Rails | `rspec` or `rails test`<br>`rubocop`, `srb tc`<br>`rails db:migrate` |
| Go | Go modules | — | `go test ./...`<br>`go vet`, `golangci-lint`<br>`go build ./...` |
| Rust | Cargo | — | `cargo test`<br>`cargo clippy`, `cargo fmt --check`<br>`cargo build` |
| Java / Kotlin | Maven, Gradle (wrappers preferred) | Spring Boot, Android | `mvn test` / `gradle test`<br>`gradle check`<br>package / build |
| C# / F# (.NET) | dotnet (`.sln`, `.csproj`, `.fsproj`) | — | `dotnet test`<br>`dotnet format --verify-no-changes`<br>`dotnet build` |
| PHP | Composer | Laravel, Symfony | `php artisan test` / `phpunit`<br>`phpstan`, `pint` / `php-cs-fixer`<br>`artisan migrate` |
| Elixir | Mix | Phoenix | `mix test`<br>`mix credo`, `mix format --check-formatted` |
| Dart | pub | Flutter | `flutter test` / `dart test`<br>`flutter analyze` / `dart analyze` |
| Swift / Obj-C | SwiftPM, Xcode | — | `swift test` / `xcodebuild test`<br>`swift build` |
| C / C++ | CMake, Meson | — | `ctest` / `meson test`<br>CMake build |

| Also detected, any language | What it gives the profile |
|---|---|
| Task runners: Makefile, `justfile`, `Taskfile.yml` | targets such as `test`, `lint`, `check`, `build`, `dev` |
| Containers: Docker Compose, Dockerfile, devcontainer, Tilt | where commands have to run (e.g. `docker compose exec <service> …`) |
| CI: GitHub Actions, GitLab CI, CircleCI, Jenkins, Azure Pipelines, Bitbucket Pipelines | the source of truth for the CI-equivalent checks |
| Monorepos | each sub-project up to three levels deep, reported with its own stack |

The detector only makes suggestions. CI config is treated as the source of truth, and you
confirm the profile. For any other stack, fill in `project.md` by hand: the workflow itself is
language-agnostic.

## Optional integrations

None of these is required. The workflow falls back to something else when one is missing.

| Integration | Used for | Install | Fallback |
|---|---|---|---|
| `html-plan` plugin | `/task-resolver:plan --html`: an HTML view of the plan in `planning/html/` | offered when you first use `--html` (you pick **user**, **project** or **local** scope), then runs:<br>`claude plugin install html-plan@claude-community --scope <scope>` | the normal markdown plan |
| Playwright MCP | Driving web UIs, screenshots, HTML mockups | `claude mcp add playwright npx @playwright/mcp@latest` | HTTP requests, or the project's own e2e runner |
| Security audit skill | `/task-resolver:audit` | `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit` | built-in `/security-review`, then a checklist pass |
| `code-review` skill | `/task-resolver:review` | built into Claude Code | fresh-subagent review |
| ffmpeg | Frames from screen recordings | your package manager | ask for stills |
| Code graph tools (`understand-anything` plugin, `graphify`) | Faster discussion on large codebases | understand-anything:<br>`/plugin install understand-anything`<br>graphify:<br>`pipx install graphifyy`<br>`graphify install` | plain search |

## Troubleshooting

- **"blocked: outside the working directory"** when a stage reads its playbook. Your settings have
  `permissions.blockReadsOutsideWorkingDirectories` on, and the plugin's stage and template files live
  outside your project. Add the plugin folder (`/add-dir <plugin path>`, or `permissions.additionalDirectories`
  in settings). The error names the path.

## Development

```
python3 tools/lint.py            # add --strict to fail on warnings too
```

Runs `claude plugin validate --strict`, `bash -n` and shellcheck (when installed: `pip install shellcheck-py`),
then checks permission rules in command frontmatter, links and anchors, `/task-resolver:*` references, stage
numbering, path variables and the `config.json` schema.

Requirements: `bash` and `python3` (archive link check). `sha256sum` or `shasum` is needed for the
archive copy check; both work on Linux and macOS.

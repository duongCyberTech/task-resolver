# Environment: the project profile and how to use it

This skill works on any language or framework because it never hard-codes a command. Every
command it runs comes from the **project profile**, `.claude/workflows/workframe/project.md`
([template](../templates/project.md)).

## Building the profile

Run this when `/task-resolver:setup` runs, or at intake if the profile is missing:

1. Run `bash ${CLAUDE_SKILL_DIR}/scripts/detect-stack.sh .` from the repo root. It lists every
   project root it finds (monorepo sub-projects included), with its language, framework, package
   manager and *suggested* commands.
2. Confirm the suggestions against sources that are true for this repo, in this order:
   1. the CI config (`.github/workflows/`, `.gitlab-ci.yml`, …): **what CI runs is the definition of done**;
   2. `Makefile`, `justfile`, `Taskfile.yml`, the `package.json` scripts, `bin/` and `scripts/`;
   3. README, CONTRIBUTING, CLAUDE.md;
   4. container files (`compose.yaml`, `.devcontainer/`). If the app runs in a container, the
      commands must run there too (e.g. `docker compose exec web <cmd>`).
3. Write the profile. Mark anything you couldn't confirm as *inferred*.
4. Show the user the Commands table and ask them to confirm or correct it. Record the date in
   *Confirmed by the user*. Before that, treat the profile as a draft. You can still use it, but
   name any command that fails on its first run.

If the stack is one the script doesn't know, fill the profile in by hand from the same sources,
or ask the user.

## Baseline

Before the first edit, run the profile's single-file tests for the files you'll touch, the type
check and the lint on those files, and record what already fails. "Pre-existing" is then a fact,
not a guess. After the change, everything is judged **against the baseline**: no new failures, no
new type errors, no new lint offences.

## Tests

- Run test files **one at a time**, never several runs in parallel or in the background. Stacked
  runs can wedge shared resources (a test DB, a container, a port).
- If a run hangs, look for a leftover process, lock file or open DB connection before running it
  again. Kill only processes you started.
- Run every suite you touched, plus a sweep of the suites next to it. Run the full suite only if
  the profile says it is practical locally. Otherwise say it wasn't run, and why.

## CI-equivalent checks

After the last sub-task, run the profile's **CI-equivalent checks** list. Common ones:

| Check | Typical commands (confirm in the profile) |
|---|---|
| Type check | `tsc --noEmit`, `mypy`, `pyright`, `go vet`, `cargo check`, `phpstan`, `srb tc`, `dotnet build` |
| Lint / format | `eslint`, `ruff`, `rubocop`, `golangci-lint`, `clippy`, `ktlint`, `pint`, `credo`, `dotnet format` |
| Build / assets | `vite build`, `next build`, `webpack`, `cargo build`, `go build`, `gradle build`, `xcodebuild` |
| Schema dump | `schema.rb` / `structure.sql`, Django migrations check, Prisma / Drizzle / Alembic / EF migrations |

If the change didn't touch a check's area (no assets changed, say), write "not needed", with the reason.

## Database and migrations

- Every new column, field or flag needs an answer to "what does an existing row do?" before it is
  built. Pick defaults so that a NULL or legacy row keeps today's behaviour. An *inclusion* flag
  silently switches existing records off. An *exclusion* flag doesn't.
- Plan batched backfills even if a migration-safety linter (strong_migrations, squawk,
  django-migration-linter, …) is a no-op locally.
- Say how the schema dump or migration lock file is regenerated, and check it after migrating.

## Containers and file sync

When the app runs in a container with a bind mount, some editors and `sed -i` / `perl -pi` replace
the file's inode, and the container can keep serving the old file. Edit in place, or compare the
checksum inside the container (`docker compose exec <svc> md5sum <file>`). Restart the process if
it caches code.

## The working tree isn't yours alone

The user may edit, merge or commit while you work. Re-read a file before editing it. Never revert a
change you didn't make. Any scripted mass edit must touch only lines in your own diff; check the
diff afterwards.

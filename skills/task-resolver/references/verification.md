# Verification: evidence rules and toolbox

## Evidence rules

- Every claim about the code, the data or the environment says **how it was checked**: the
  `file:line` read, the command run with its result line, the request made with its response, the
  screenshot taken. A claim you couldn't check is labelled *inferred*.
- Evidence never carries secrets. Write tokens, cookies, passwords, API keys and connection strings as
  `<redacted>` in commands, logs, scripts and captured output, and crop or blur them in screenshots.
  The archive keeps everything, and the task logs may be committed.
- Numbers are measured, never estimated: query counts, timings, row counts, bundle sizes. If one
  turns out wrong later, correct it in place with a dated note.
- A claim resting on one file (an env file, a config) may be wrong. Values often come from
  somewhere else: dotenv chains, secrets managers, framework defaults, container env. Check the
  running app before you build on it.
- "The tests pass" isn't proof that a feature works. User-visible behaviour is verified by driving
  the real thing (see below). In past runs, the running app caught real bugs the tests couldn't in
  nearly half of all tasks: text clipped because it was measured while hidden, an empty picker, a
  date control that locked out valid dates, a misleading label.

## Toolbox, by kind of project

Pick the rows that match the profile's *Kind of project*. Several can apply (a web app with an API
and background jobs).

| Kind | Drive the behaviour with | Check the server side with |
|---|---|---|
| Web UI | the Playwright MCP server (or the project's own e2e runner). Screenshot every state you claim | console / REPL from the profile, or a one-off script |
| HTTP / gRPC API | `curl` / `httpie` / `grpcurl` with a real session or token from the dev environment | DB queries, logs |
| CLI tool | run the built binary with real arguments; capture stdout, stderr and exit code | the files or state it changed |
| Library / SDK | a scratch program or REPL session that uses the public API the way a caller would | — |
| Mobile / desktop | the simulator or emulator with screenshots, or the platform UI test runner | device logs |
| Background jobs / data pipelines | run the job on a small fixture and check the output, with row counts | the target store |
| Infrastructure as code | `plan` / `diff` / dry-run only. **Never apply** without an explicit yes | — |

**One-off scripts** go in the profile's scripts folder (default `.claude/workflows/scripts/`),
written so they can be re-run or pasted into the project's console. Name them after the task.

**Side effects.** Anything that leaves the machine (email, SMS, calls, payments, webhooks, provider
API writes) is stubbed at the boundary or caught by a dev catcher (mailcatcher, Mailpit, a test
mode key) unless the user has approved a real call. See non-negotiable 7.

**UI fixes shift their neighbours.** After a layout fix, re-screenshot the whole row or section,
not just the element you fixed.

## Mockups and recordings

- **HTML mockups:** open them in the browser tool, and screenshot each state the requirement names.
- **Images:** view them, and describe in writing what bears on the work (layout, labels, states).
- **Recordings (mov/mp4/webm):** extract frames with ffmpeg, then cite them by id:
  ```bash
  mkdir -p <dir>/frames
  ffmpeg -i <video> -vf "fps=1,scale=1280:-1" <dir>/frames/f%03d.png
  # contact sheet, for a quick overview:
  ffmpeg -i <video> -vf "fps=1,scale=320:-1,tile=6x6" -frames:v 1 <dir>/contact-sheet.png
  ```
  If ffmpeg isn't installed, say so and ask the user for stills.
- **Media over ~5 MB** isn't copied into the workspace. Record its path, size and sha256, and keep
  the extracted frames instead.
- If the requirement names a mockup the repo doesn't have, say so. Never invent one.

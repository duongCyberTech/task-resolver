# Testing logs — <task title>

Executed <YYYY-MM-DD> against the dev app (host port 4000, logged in as <user>), with server-side
checks run inside the web container.

| # | Scenario | Result |
|---|----------|--------|
| 1 | [<title>](01-<slug>.md) | pass / pass after fixing a defect it found / partial / not run — <why> |

## Defects found

| # | Scenario | Defect | Fix | Test added |
|---|---|---|---|---|

## Dev data this run created

Left in place (it is the user's database) unless noted:

| Where | What | Cleanup |
|---|---|---|

## Method notes

- <harness: Playwright / HTTP with session cookie / console scripts in `.claude/ruby-script/`>
- <how irreversible calls were avoided (stubbed `fetch`, mail catcher)>
- <false alarms, so nobody re-chases them>

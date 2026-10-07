# Testing logs — <task title>

Executed <YYYY-MM-DD> against <where: dev app at <url> / CLI build / staging>, as <user or caller>,
with state checks via <console / scripts / DB queries>.

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

- <harness: Playwright MCP / HTTP with a real session or token / CLI runs / scripts in the scripts folder>
- <how irreversible calls were avoided (stubbed client, provider test mode, mail catcher)>
- <false alarms, so nobody re-chases them>

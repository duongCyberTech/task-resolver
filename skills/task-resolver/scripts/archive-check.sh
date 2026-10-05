#!/usr/bin/env bash
# Verify a task archive before the workspace is cleared. Read only: never modifies either tree.
#
#   bash .claude/skills/task-resolver/scripts/archive-check.sh <workspace-dir> <archive-dir>
#   bash .claude/skills/task-resolver/scripts/archive-check.sh --links-only <archive-dir>
#
# 1. copy check  — every file under <workspace-dir> exists in <archive-dir> with the same sha256
# 2. link check  — every relative markdown link in <archive-dir> resolves, either relative to the
#                  file or to the repo root (links like `.claude/workflows/...`)
# Prints ARCHIVE-OK and exits 0 only when both pass.
set -euo pipefail

links_only=0
if [[ "${1:-}" == "--links-only" ]]; then links_only=1; shift; fi

if (( links_only )); then
  [[ $# -eq 1 ]] || { echo "usage: $0 --links-only <archive-dir>" >&2; exit 2; }
  archive=$(cd "$1" && pwd)
else
  [[ $# -eq 2 ]] || { echo "usage: $0 <workspace-dir> <archive-dir>" >&2; exit 2; }
  workspace=$(cd "$1" && pwd)
  archive=$(cd "$2" && pwd)
fi

status=0

if (( ! links_only )); then
  total=0; bad=0
  while IFS= read -r -d '' f; do
    rel=${f#"$workspace"/}
    total=$((total + 1))
    if [[ ! -f "$archive/$rel" ]]; then
      echo "MISSING   $rel"; bad=$((bad + 1)); continue
    fi
    a=$(sha256sum < "$f" | cut -d' ' -f1)
    b=$(sha256sum < "$archive/$rel" | cut -d' ' -f1)
    if [[ "$a" != "$b" ]]; then echo "DIFFERS   $rel"; bad=$((bad + 1)); fi
  done < <(find "$workspace" -type f -print0)
  if (( bad == 0 )); then
    echo "COPY-OK   $total files match"
  else
    echo "COPY-FAIL $bad of $total files missing or different"; status=1
  fi
fi

repo_root=$(cd "$archive" && d=$PWD; while [[ "$d" != / && ! -e "$d/.git" ]]; do d=$(dirname "$d"); done; echo "$d")

python3 - "$archive" "$repo_root" <<'PY' || status=1
import pathlib, re, sys, urllib.parse

archive, repo = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
link = re.compile(r'\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)')
fence = re.compile(r'^\s*(```|~~~)')
broken = []
for md in sorted(archive.rglob('*.md')):
    in_fence = False
    for n, line in enumerate(md.read_text(errors='ignore').splitlines(), 1):
        if fence.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        line = re.sub(r'`[^`]*`', '', line)  # links shown as code are examples, not links
        for m in link.finditer(line):
            target = m.group(1).split('#', 1)[0]
            if not target or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
                continue  # pure anchor, or a scheme (https:, mailto:, file:)
            target = urllib.parse.unquote(target)
            if (md.parent / target).exists() or (repo / target).exists():
                continue
            broken.append(f"{md.relative_to(archive)}:{n} -> {m.group(1)}")
if broken:
    print(f"LINKS-FAIL {len(broken)} broken")
    print("\n".join(f"BROKEN    {b}" for b in broken))
    sys.exit(1)
print("LINKS-OK")
PY

if (( links_only )); then exit $status; fi
if (( status == 0 )); then echo "ARCHIVE-OK"; else echo "ARCHIVE-FAIL — do not clear the workspace"; fi
exit $status

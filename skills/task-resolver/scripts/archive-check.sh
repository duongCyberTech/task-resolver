#!/usr/bin/env bash
# Verify a task archive before the workspace is cleared, and optionally clear it.
#
#   bash archive-check.sh <workspace-dir> <archive-dir>           verify only (read only)
#   bash archive-check.sh --clear <workspace-dir> <archive-dir>   verify, then clear the workspace on success
#   bash archive-check.sh --links-only <dir>                      link check only (read only)
#
# 1. copy check  — every file under <workspace-dir> exists in <archive-dir> with the same sha256
# 2. link check  — every relative markdown link in <archive-dir> resolves, either relative to the
#                  file or to the project root (links like `.claude/workflows/...`). The project root
#                  is the nearest folder above the archive that holds `.claude/workflows` or `.git`.
# Prints ARCHIVE-OK and exits 0 only when both pass. With --clear, the workspace is emptied and its
# skeleton recreated in the same run, and only after ARCHIVE-OK, so a failed check can never be
# followed by a clear.
set -euo pipefail

mode=verify
case "${1:-}" in
  --links-only) mode=links; shift ;;
  --clear) mode=clear; shift ;;
esac

if [[ $mode == links ]]; then
  [[ $# -eq 1 ]] || { echo "usage: $0 --links-only <dir>" >&2; exit 2; }
  archive=$(cd "$1" && pwd -P)
else
  [[ $# -eq 2 ]] || { echo "usage: $0 [--clear] <workspace-dir> <archive-dir>" >&2; exit 2; }
  workspace=$(cd "$1" && pwd -P)
  archive=$(cd "$2" && pwd -P)
  if [[ $archive == "$workspace" || $archive == "$workspace"/* ]]; then
    echo "the archive must not be the workspace or inside it" >&2; exit 2
  fi
  if [[ $mode == clear && $workspace != */.claude/workflows/workspace ]]; then
    echo "refusing to clear $workspace: not a .claude/workflows/workspace folder" >&2; exit 2
  fi
fi

status=0

# sha256sum (GNU coreutils) or shasum (macOS / BSD)
if command -v sha256sum >/dev/null; then hash() { sha256sum | cut -d' ' -f1; }
elif command -v shasum >/dev/null; then hash() { shasum -a 256 | cut -d' ' -f1; }
else echo "need sha256sum or shasum" >&2; exit 2; fi
command -v python3 >/dev/null || { echo "need python3 for the link check" >&2; exit 2; }

if [[ $mode != links ]]; then
  total=0; bad=0
  while IFS= read -r -d '' f; do
    rel=${f#"$workspace"/}
    total=$((total + 1))
    if [[ ! -f "$archive/$rel" ]]; then
      echo "MISSING   $rel"; bad=$((bad + 1)); continue
    fi
    a=$(hash < "$f")
    b=$(hash < "$archive/$rel")
    if [[ "$a" != "$b" ]]; then echo "DIFFERS   $rel"; bad=$((bad + 1)); fi
  done < <(find "$workspace" -type f -print0)
  if (( bad == 0 )); then
    echo "COPY-OK   $total files match"
  else
    echo "COPY-FAIL $bad of $total files missing or different"; status=1
  fi
fi

project_root=$(d=$archive; while [[ $d != / && ! -d $d/.claude/workflows && ! -e $d/.git ]]; do d=$(dirname "$d"); done; echo "$d")

# -I: isolated mode, so a module planted in the current directory (re.py, pathlib.py) is never imported.
python3 -I - "$archive" "$project_root" <<'PY' || status=1
import pathlib, re, sys, urllib.parse

archive, root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
link = re.compile(r'\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)')
fence = re.compile(r'^\s*(```|~~~)')
broken = []
for md in sorted(archive.rglob('*.md')):
    in_fence = False
    for n, line in enumerate(md.read_text(encoding='utf-8', errors='replace').splitlines(), 1):
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
            if (md.parent / target).exists() or (root / target).exists():
                continue
            broken.append(f"{md.relative_to(archive)}:{n} -> {m.group(1)}")
if broken:
    print(f"LINKS-FAIL {len(broken)} broken")
    print("\n".join(f"BROKEN    {b}" for b in broken))
    sys.exit(1)
print("LINKS-OK")
PY

if [[ $mode == links ]]; then exit $status; fi
if (( status != 0 )); then
  echo "ARCHIVE-FAIL — do not clear the workspace"
  exit $status
fi
echo "ARCHIVE-OK"
if [[ $mode == clear ]]; then
  find "$workspace" -mindepth 1 -delete
  mkdir -p "$workspace"/{discussion,planning,implementation,testing,code-review}
  echo "CLEARED   $workspace (empty skeleton recreated)"
fi
exit 0

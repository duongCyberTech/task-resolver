#!/usr/bin/env python3
"""Lint the task-resolver plugin. Read only.

    python3 tools/lint.py [--strict]

Runs Claude Code's own validator, `bash -n` and shellcheck when they are installed, then the checks
the validator can't do: permission rules, links and anchors, cross-references, stage numbering,
path variables and the config.json schema. Exits 1 on any ERROR (with --strict, on any WARN too).
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = ROOT / "skills" / "task-resolver"
COMMANDS = ROOT / "commands"

STAGES = ["requirements", "discuss", "plan", "implement", "test", "audit", "code review", "feedback", "archive"]
STAGE_ALIASES = {"intake": "requirements", "review": "code review"}
REQUIRED_STAGES = {"requirements", "plan", "implement", "archive"}
SCOPES = {"user", "project", "local"}
# Marker that SKILL.md must carry: supporting files are read raw, so it has to spell the paths out.
PATH_NOTE = "are read as plain files"
# Bash rules whose trailing wildcard would let extra arguments run code, install or publish.
RISKY_PREFIXES = ("bash", "sh", "zsh", "python", "python3", "node", "npx", "eval", "sudo", "curl", "wget",
                  "rm", "git push", "claude plugin install", "claude plugin enable", "claude plugin marketplace",
                  "claude mcp add")

findings = []


def report(level, path, line, msg):
    rel = path.relative_to(ROOT) if isinstance(path, Path) and path.is_absolute() else path
    findings.append((level, f"{rel}:{line}" if line else str(rel), msg))


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return None, text
    try:
        import yaml  # optional
        return yaml.safe_load(m.group(1)) or {}, text
    except ImportError:
        pass
    data, key = {}, None
    for raw in m.group(1).splitlines():
        if re.match(r"^\s+-\s", raw) and key:
            data.setdefault(key, []).append(raw.split("-", 1)[1].strip().strip("\"'"))
        elif ":" in raw and not raw.startswith(" "):
            key, val = raw.split(":", 1)
            key, val = key.strip(), val.strip().strip("\"'")
            data[key] = val if val else []
    return data, text


def tool_list(value):
    if value is None:
        return []
    if isinstance(value, str):  # "A, B(x y), C" or "A B"
        return [t.strip() for t in re.findall(r"[\w-]+(?:\([^)]*\))?", value)]
    return [str(v).strip() for v in value]


def run(cmd, cwd=ROOT):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p.returncode, (p.stdout + p.stderr).strip()


# ---------------------------------------------------------------- external validators
def external():
    if shutil.which("claude"):
        for target in (".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", "commands", "skills"):
            code, out = run(["claude", "plugin", "validate", "--strict", target])
            if code:
                report("ERROR", ROOT / target, None, "claude plugin validate --strict failed:\n    " + out.replace("\n", "\n    "))
    else:
        report("WARN", ROOT, None, "claude not on PATH: skipped `claude plugin validate`")
    scripts = sorted(ROOT.rglob("*.sh"))
    for s in scripts:
        code, out = run(["bash", "-n", str(s)])
        if code:
            report("ERROR", s, None, f"bash -n: {out}")
        if not os.access(s, os.X_OK):
            report("WARN", s, None, "not executable")
    if shutil.which("shellcheck"):
        for s in scripts:
            code, out = run(["shellcheck", "-x", "-S", "warning", str(s)])
            if code:
                report("ERROR", s, None, "shellcheck:\n    " + out.replace("\n", "\n    "))
    else:
        report("WARN", ROOT, None, "shellcheck not on PATH: skipped (pip install shellcheck-py)")


# ---------------------------------------------------------------- JSON
def manifests():
    pj = ROOT / ".claude-plugin" / "plugin.json"
    try:
        data = json.loads(pj.read_text(encoding="utf-8"))
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", data.get("name", "")):
            report("ERROR", pj, None, "name must be kebab-case")
        if not re.fullmatch(r"\d+\.\d+\.\d+(-[\w.]+)?", str(data.get("version", ""))):
            report("WARN", pj, None, "version is not semver")
    except (OSError, ValueError) as e:
        report("ERROR", pj, None, f"invalid JSON: {e}")

    cj = ROOT / "config.json"
    try:
        cfg = json.loads(cj.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        report("ERROR", cj, None, f"invalid JSON: {e}")
        return
    stages = cfg.get("stages")
    if not isinstance(stages, list):
        report("ERROR", cj, None, "`stages` must be a list")
    else:
        names = {STAGE_ALIASES.get(s, s) for s in stages}
        for s in stages:
            if STAGE_ALIASES.get(s, s) not in STAGES:
                report("ERROR", cj, None, f"unknown stage {s!r} (known: {', '.join(STAGES)})")
        for s in sorted(REQUIRED_STAGES - names):
            report("WARN", cj, None, f"stage {s!r} is always run; listing it keeps the file honest")
    for kind, key in (("plugins", "id"), ("mcps", "name"), ("skills", "name")):
        items = cfg.get(kind, [])
        if not isinstance(items, list):
            report("ERROR", cj, None, f"`{kind}` must be a list")
            continue
        for i, it in enumerate(items):
            where = f"{kind}[{i}]"
            if not isinstance(it, dict) or not it.get(key):
                report("ERROR", cj, None, f"{where}: needs `{key}`")
                continue
            if kind == "plugins" and "@" not in it["id"]:
                report("ERROR", cj, None, f"{where}: id must be plugin@marketplace")
            if it.get("scope") not in SCOPES:
                report("ERROR", cj, None, f"{where}: scope must be one of {sorted(SCOPES)}")
            if "use_for" in it and not (isinstance(it["use_for"], list) and all(isinstance(u, str) for u in it["use_for"])):
                report("ERROR", cj, None, f"{where}: use_for must be a list of strings")


# ---------------------------------------------------------------- frontmatter + permissions
def permissions_and_frontmatter():
    files = sorted(COMMANDS.glob("*.md")) + [SKILL_DIR / "SKILL.md"]
    denies = {}
    for f in files:
        fm, text = frontmatter(f)
        if fm is None:
            report("ERROR", f, 1, "missing frontmatter")
            continue
        if not str(fm.get("description", "")).strip():
            report("ERROR", f, 1, "empty description")
        if f.parent == COMMANDS and "name" in fm:
            report("WARN", f, 1, "`name` renames the command's last segment; drop it to keep /task-resolver:" + f.stem)
        if f.name == "SKILL.md":
            listing = len(str(fm.get("description", ""))) + len(str(fm.get("when_to_use", "")))
            if listing > 1536:
                report("ERROR", f, 1, f"description + when_to_use is {listing} chars; the listing truncates at 1536")
            if len(text.splitlines()) > 500:
                report("WARN", f, None, "SKILL.md is over 500 lines; move detail into references/")
        for rule in tool_list(fm.get("allowed-tools")):
            m = re.fullmatch(r"(\w+)(?:\((.*)\))?", rule)
            if not m:
                continue
            tool, arg = m.group(1), m.group(2)
            if tool in ("Bash", "Write", "Edit", "NotebookEdit") and not arg:
                report("ERROR", f, 1, f"allowed-tools `{rule}` pre-approves the tool for any input")
                continue
            if tool != "Bash" or arg is None:
                continue
            body = arg[:-2] if arg.endswith(" *") else arg[:-1] if arg.endswith("*") else arg
            if "*" in body:
                report("ERROR", f, 1, f"allowed-tools `{rule}`: a mid-pattern wildcard matches any text there, e.g. `bash -c '<code>'`")
            elif arg.endswith("*") and any(body == p or body.startswith(p + " ") for p in RISKY_PREFIXES):
                report("ERROR", f, 1, f"allowed-tools `{rule}`: the trailing wildcard absorbs extra flags or code; list the exact commands")
        if f.parent == COMMANDS:
            denies[f.stem] = {d for d in tool_list(fm.get("disallowed-tools")) if d.startswith("Bash(git ")}
    union = set().union(*denies.values()) if denies else set()
    for name, have in sorted(denies.items()):
        missing = sorted(union - have)
        if missing:
            report("WARN", COMMANDS / f"{name}.md", 1, f"disallowed-tools lacks {len(missing)} git rules the other commands have: {', '.join(missing)}")


# ---------------------------------------------------------------- links, anchors, references
def slug(heading):
    return re.sub(r"[^\w\- ]", "", heading.strip().lower()).replace(" ", "-")


def markdown_files():
    for f in sorted(ROOT.rglob("*.md")):
        if ".git" in f.parts or "templates" in f.relative_to(ROOT).parts:
            continue  # templates link to files that exist only in a generated workspace
        yield f


def links_and_refs():
    link = re.compile(r"\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
    commands = {c.stem for c in COMMANDS.glob("*.md")}
    for f in markdown_files():
        in_fence = False
        for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if re.match(r"^\s*(```|~~~)", line):
                in_fence = not in_fence
            for cmd in re.findall(r"/task-resolver:([a-z][a-z-]*)", line):
                if cmd not in commands and cmd != "task-resolver":
                    report("ERROR", f, n, f"/task-resolver:{cmd} has no commands/{cmd}.md")
            if re.search(r"/trlr:|\.claude/skills/task-resolver", line):
                report("ERROR", f, n, "stale path or command name (/trlr:, .claude/skills/task-resolver)")
            for ref in re.findall(r"\$\{CLAUDE_PLUGIN_ROOT\}/([\w./-]+\.(?:md|sh|json))", line):
                if not (ROOT / ref).exists():
                    report("ERROR", f, n, f"${{CLAUDE_PLUGIN_ROOT}}/{ref} does not exist")
            for ref in re.findall(r"\$\{CLAUDE_SKILL_DIR\}/([\w./-]+\.(?:md|sh|json))", line):
                if not (SKILL_DIR / ref).exists():
                    report("ERROR", f, n, f"${{CLAUDE_SKILL_DIR}}/{ref} does not exist")
            if in_fence:
                continue
            for m in link.finditer(re.sub(r"`[^`]*`", "", line)):
                target, _, anchor = m.group(1).partition("#")
                if re.match(r"^[a-zA-Z][\w+.-]*:", target):
                    continue
                dest = (f.parent / target) if target else f
                if target and not dest.exists():
                    report("ERROR", f, n, f"broken link {m.group(1)}")
                elif anchor and dest.suffix == ".md":
                    heads = {slug(h) for h in re.findall(r"^#+\s+(.*)$", dest.read_text(encoding="utf-8"), re.M)}
                    if anchor not in heads:
                        report("ERROR", f, n, f"missing anchor #{anchor} in {dest.relative_to(ROOT)}")


def stage_numbers():
    skill = (SKILL_DIR / "SKILL.md").read_text(encoding="utf-8")
    table = {}
    for m in re.finditer(r"^\| (\d+) \| [^|]+ \| [^|]+ \| \[stages/(\w+)\.md\]", skill, re.M):
        table.setdefault(m.group(2), []).append(int(m.group(1)))
    for stem, nums in table.items():
        f = SKILL_DIR / "stages" / f"{stem}.md"
        header = f.read_text(encoding="utf-8").splitlines()[0]
        m = re.search(r"Stages? (\d+)(?:–(\d+))?", header)
        if not m:
            continue
        got = list(range(int(m.group(1)), int(m.group(2) or m.group(1)) + 1))
        if got != sorted(nums):
            report("ERROR", f, 1, f"header numbers stage(s) {got}, SKILL.md's table says {sorted(nums)}")


def path_variables():
    raw_files = [p for p in SKILL_DIR.rglob("*.md") if p.name != "SKILL.md"]
    if any(re.search(r"\$\{CLAUDE_(SKILL_DIR|PLUGIN_ROOT|PROJECT_DIR)\}", p.read_text(encoding="utf-8")) for p in raw_files):
        if PATH_NOTE not in (SKILL_DIR / "SKILL.md").read_text(encoding="utf-8"):
            report("ERROR", SKILL_DIR / "SKILL.md", None,
                   "supporting files use ${CLAUDE_*} variables, which are substituted only in SKILL.md and command "
                   "bodies (not in files read later, nor exported to Bash); SKILL.md must spell the paths out")


def main():
    strict = "--strict" in sys.argv[1:]
    for check in (external, manifests, permissions_and_frontmatter, links_and_refs, stage_numbers, path_variables):
        check()
    for level, where, msg in findings:
        print(f"{level:5}  {where}  {msg}")
    errors = sum(1 for f in findings if f[0] == "ERROR")
    warns = len(findings) - errors
    print(f"\n{errors} error(s), {warns} warning(s)")
    sys.exit(1 if errors or (strict and warns) else 0)


if __name__ == "__main__":
    main()

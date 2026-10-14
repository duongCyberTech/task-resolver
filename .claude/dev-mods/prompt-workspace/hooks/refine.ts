import type { Refined, SectionKey, Sections, Workspace } from '../types'

export const SECTIONS: readonly { key: SectionKey; title: string }[] = [
  { key: 'requirements', title: 'Requirements' },
  { key: 'objectives', title: 'Objectives' },
  { key: 'environment', title: 'Environment' },
  { key: 'constraints', title: 'Constraints' },
  { key: 'rules', title: 'Rules' },
]

export const SYSTEM = `You rewrite a developer's request into a clear, well-structured prompt for an autonomous coding agent.

Return ONLY a JSON object, no prose, no code fence:
{"title": string, "requirements": string[], "objectives": string[], "environment": string[], "constraints": string[], "rules": string[]}

- title: a short imperative name for the task (max 8 words).
- requirements: the concrete, verifiable things that must be built or changed.
- objectives: the outcome / why; what "done" looks like.
- environment: only workspace facts relevant to this task (repo, branch, stack, how commands are run).
- constraints: limits, what must not change, scope boundaries, compatibility.
- rules: project rules from the provided rule files that apply to this task, paraphrased tightly.

Keep the developer's intent exactly. Never invent features they did not ask for. Resolve ambiguity by stating the most sensible assumption as a bullet prefixed "Assume:". Each bullet is one short sentence. An empty array is fine.`

export function buildPrompt(text: string, ws: Workspace, rulesText: string): string {
  return [
    '<workspace>',
    `cwd: ${ws.cwd}`,
    `git branch: ${ws.branch || 'unknown'}`,
    `rule files: ${ws.ruleFiles.join(', ') || 'none'}`,
    '</workspace>',
    '<project_rules>',
    rulesText || '(none)',
    '</project_rules>',
    '<request>',
    text,
    '</request>',
  ].join('\n')
}

const asList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim())
    : []

export function parseRefined(original: string, reply: string): Refined | null {
  const start = reply.indexOf('{')
  const end = reply.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(reply.slice(start, end + 1))
  } catch {
    return null
  }
  const sections = Object.fromEntries(SECTIONS.map(s => [s.key, asList(raw[s.key])])) as Sections
  if (SECTIONS.every(s => sections[s.key].length === 0)) return null
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Task'

  return { original, title, sections }
}

export function toMarkdown(r: Refined): string {
  const parts = [`# ${r.title}`]
  for (const s of SECTIONS) {
    const items = r.sections[s.key]
    if (items.length) parts.push(`## ${s.title}\n${items.map(i => `- ${i}`).join('\n')}`)
  }

  return parts.join('\n\n')
}

import type { Refined } from '../types'
import { SECTIONS } from './refine'

// The task-resolver intake commands this middleware sits in front of: the plugin's, and a project-local copy's (`.claude/commands/trlr/`).
export const INTAKE_COMMANDS = ['task-resolver:start', 'trlr:start'] as const

export const REQUIREMENTS_DIR = '.claude/workflows/workframe/requirements'
export const REQUIREMENTS_INDEX = `${REQUIREMENTS_DIR}/index.md`
// Written only after the user approves it; the intake snapshot picks it up with the rest of the folder.
export const REFINED_FILE = `${REQUIREMENTS_DIR}/refined.md`

const REQUIREMENT_BUDGET = 30000

// The requirement text sent to the refiner: the workframe index (when present) plus whatever was typed after the command.
export function requirementText(index: string | null, args: string, notes = '', command = 'task-resolver:start'): string {
  const parts: string[] = []
  if (index?.trim()) parts.push(`# ${REQUIREMENTS_INDEX}\n${index.trim()}`)
  if (args.trim()) parts.push(`# Typed with /${command}\n${args.trim()}`)
  if (notes.trim()) parts.push(`# Reviewer notes on the previous refinement (apply these)\n${notes.trim()}`)

  return parts.join('\n\n').slice(0, REQUIREMENT_BUDGET)
}

// refined.md: the reviewed restatement the intake stage reads beside index.md.
export function toRequirementDoc(r: Refined, approvedAt: string): string {
  const parts = [
    `# ${r.title}`,
    `> Refined by the prompt-workspace mod and approved by the user on ${approvedAt}.`,
    `> The original requirement files in this folder remain the source; this is the user-reviewed restatement of them.`,
  ]
  for (const s of SECTIONS) {
    const items = r.sections[s.key]
    if (items.length) parts.push(`## ${s.title}\n${items.map(i => `- ${i}`).join('\n')}`)
  }

  return parts.join('\n\n') + '\n'
}

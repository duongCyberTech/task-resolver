import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Refined, Status, Workspace } from '../types'
import { INTAKE_COMMANDS, REFINED_FILE, REQUIREMENTS_INDEX, requirementText, toRequirementDoc } from './intake'
import { SECTIONS, SYSTEM, buildPrompt, parseRefined, toMarkdown } from './refine'

const PANE = 'prompt-workspace'
const TITLE = 'Workspace'

const refined = atom({ plugin: 'prompt-workspace', key: 'refined' } as const, null)
const status = atom({ plugin: 'prompt-workspace', key: 'status' } as const, { kind: 'idle' })
const workspace = atom({ plugin: 'prompt-workspace', key: 'workspace' } as const, { cwd: '', branch: '', ruleFiles: [] })
const isAuto = atom({ plugin: 'prompt-workspace', key: 'isAuto' } as const, false)
const intake = atom({ plugin: 'prompt-workspace', key: 'intake' } as const, null)

const RULE_BUDGET = 12000

async function listRuleFiles($: EngineInterface, dir: string, depth = 0): Promise<string[]> {
  if (depth > 3 || !(await $.fs.exists(dir))) return []
  const out: string[] = []
  for (const entry of await $.fs.list(dir)) {
    const path = `${dir}/${entry.name}`
    if (entry.kind === 'dir') out.push(...(await listRuleFiles($, path, depth + 1)))
    else if (entry.kind === 'file' && entry.name.endsWith('.md')) out.push(path)
  }

  return out.sort()
}

async function scanWorkspace($: EngineInterface, cwd: string): Promise<Workspace> {
  const git = await $.process.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 5000 }).catch(() => null)
  const branch = git?.exitCode === 0 ? git.stdout.trim() : ''
  const ruleFiles = await listRuleFiles($, '.claude/rules').catch((): string[] => [])
  for (const top of ['CLAUDE.md', 'CLAUDE.local.md']) {
    if (await $.fs.exists(top).catch(() => false)) ruleFiles.push(top)
  }

  return { cwd, branch, ruleFiles }
}

async function readRules($: EngineInterface, files: string[]): Promise<string> {
  let text = ''
  for (const file of files) {
    if (text.length >= RULE_BUDGET) break
    const body = await $.fs.read(file).catch(() => '')
    text += `### ${file}\n${body.trim()}\n\n`
  }

  return text.slice(0, RULE_BUDGET)
}

async function setStatus($: EngineInterface, next: Status) {
  await update($, status, () => next)
}

async function refine($: EngineInterface, model: string, text: string): Promise<Refined | null> {
  await setStatus($, { kind: 'refining' })
  void $.ui.open({ id: PANE, title: TITLE })
  const ws = await read($, workspace)
  const reply = await $.model.complete({
    model,
    system: SYSTEM,
    prompt: buildPrompt(text, ws, await readRules($, ws.ruleFiles)),
    maxTokens: 4000,
    timeoutMs: 120000,
  })
  if (!reply.isAnswered) {
    await setStatus($, { kind: 'error', message: `model call failed: ${reply.reason}` })
    return null
  }
  const result = parseRefined(text, reply.text)
  if (!result) {
    await setStatus($, { kind: 'error', message: 'could not parse the refined prompt' })
    return null
  }
  await update($, refined, () => result)
  await setStatus($, { kind: 'idle' })

  return result
}

async function send($: EngineInterface) {
  const r = await read($, refined)
  if (!r) return
  await update($, refined, () => null)
  await $.prompt.submit({ text: toMarkdown(r) })
}

async function edit($: EngineInterface) {
  const r = await read($, refined)
  if (r) await $.prompt.fill({ text: toMarkdown(r) })
}

// Intake middleware: the paused /task-resolver:start waits here until the user approves the refined requirement.
async function refineIntake($: EngineInterface, model: string, notes = ''): Promise<Refined | null> {
  const pending = await read($, intake)
  if (!pending) return null
  const index = await $.fs.read(REQUIREMENTS_INDEX).catch(() => null)
  const previous = notes.trim() ? await read($, refined) : null
  const draft = previous ? `${notes}\n\nPrevious refinement:\n${toMarkdown(previous)}` : notes

  return refine($, model, requirementText(index, pending.args, draft, pending.command))
}

async function approveIntake($: EngineInterface) {
  const pending = await read($, intake)
  const r = await read($, refined)
  if (!pending || !r) return
  const approvedAt = new Date(await $.clock.now()).toISOString().slice(0, 10)
  await $.fs.write(REFINED_FILE, toRequirementDoc(r, approvedAt))
  await update($, refined, () => null)
  await update($, intake, () => null)
  await $.command.run({ command: pending.command, args: pending.args })
}

async function skipIntakeRefine($: EngineInterface) {
  const pending = await read($, intake)
  if (!pending) return
  // A refined.md left by an earlier task must not be read as this one's.
  if (await $.fs.exists(REFINED_FILE).catch(() => false)) {
    await $.fs.write(REFINED_FILE, '# Not refined\n\n> The user started this intake without refining. Ignore this file.\n')
  }
  await update($, refined, () => null)
  await update($, intake, () => null)
  await $.command.run({ command: pending.command, args: pending.args })
}

async function cancelIntake($: EngineInterface) {
  await update($, refined, () => null)
  await update($, intake, () => null)
}

async function refineDraft($: EngineInterface, model: string) {
  const text = (await $.prompt.read()).text.trim()
  if (text) await refine($, model, text)
  else $.ui.toast('The prompt box is empty.')
}

export const register: Register = (on, options) => {
  const model = typeof options.model === 'string' ? options.model : 'sonnet'

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'refine',
      description: 'Refine a prompt (or the current draft) into structured sections',
      argumentHint: '[prompt]',
    })
    await $.command.register({ name: 'workspace', description: 'Open the prompt Workspace pane' })
    await $.command.register({
      name: 'refine-intake',
      description: 'Re-refine the requirement of a paused task-resolver intake, applying your notes',
      argumentHint: '[notes]',
    })
    await $.command.register({
      name: 'refine-auto',
      description: 'Toggle auto-refining typed prompts into the Workspace pane',
      argumentHint: '[on|off]',
    })
    const ws = await scanWorkspace($, e.cwd).catch(() => ({ cwd: e.cwd, branch: '', ruleFiles: [] }))
    await update($, workspace, () => ws)

    return next(e)
  })

  on('command.run', { command: 'workspace' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE, focus: true })

    return { text: 'Workspace pane opened.' }
  })

  on('command.run', { command: 'refine-auto' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const value = arg === 'on' ? true : arg === 'off' ? false : !(await read($, isAuto))
    await update($, isAuto, () => value)

    return { text: `Auto-refine ${value ? 'on: typed prompts go to the Workspace pane for review' : 'off'}.` }
  })

  on('command.run', { command: 'refine' }, async ($, e) => {
    const text = e.args.trim() || (await $.prompt.read()).text.trim()
    if (!text) return { text: 'Usage: /refine <prompt>, or type a draft in the prompt box first.' }
    const r = await refine($, model, text)
    if (!r) return { text: 'Refining failed; see the Workspace pane.' }

    return { text: `Refined "${r.title}". Review it in the Workspace pane, then Send or Edit.` }
  })

  // Middleware in front of the task-resolver intake: refine the requirement, let the user review it, then run intake.
  // A run this plugin starts (Approve / Start without refining) passes straight through.
  for (const command of INTAKE_COMMANDS) on('command.run', { command }, async ($, e, next) => {
    if (e.origin.kind === 'plugin') return next(e)
    const index = await $.fs.read(REQUIREMENTS_INDEX).catch(() => null)
    if (!requirementText(index, e.args)) return next(e)
    await update($, intake, () => ({ command: e.command, args: e.args }))
    await update($, refined, () => null)
    $.clock.after(0, () => void refineIntake($, model))

    return {
      text: 'Intake paused: refining the requirement in the Workspace pane. Approve it to continue, or /refine-intake <notes> to revise.',
    }
  })

  on('command.run', { command: 'refine-intake' }, async ($, e) => {
    if (!(await read($, intake))) return { text: `No paused intake. Run /${INTAKE_COMMANDS[0]} first.` }
    const r = await refineIntake($, model, e.args)
    if (!r) return { text: 'Refining failed; see the Workspace pane.' }

    return { text: `Re-refined "${r.title}". Review it in the Workspace pane, then Approve.` }
  })

  on('prompt.submit', async ($, e, next) => {
    const text = e.text.trim()
    const isCandidate = e.origin.kind === 'composer' && !text.startsWith('/') && text.length >= 20
    if (!isCandidate || !(await read($, isAuto))) return next(e)
    $.clock.after(0, () => void refine($, model, text))

    return { drop: 'Auto-refine: prompt sent to the Workspace pane for review (/refine-auto off to disable).' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const ws = await read($, workspace)
    const r = await read($, refined)
    const st = await read($, status)
    const auto = await read($, isAuto)
    const pending = await read($, intake)

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text bold>Environment</Text>
          <Text dimColor wrap="truncate-start">cwd    {ws.cwd || '-'}</Text>
          <Text dimColor>branch {ws.branch || '-'}</Text>
          <Text dimColor>rules  {ws.ruleFiles.length} file(s)</Text>
          <Text dimColor>model  {model} · auto-refine {auto ? 'on' : 'off'}</Text>
        </Box>

        {pending && (
          <Text color="warning">
            Intake paused: /{pending.command} {pending.args} runs after you approve. Approve writes {REFINED_FILE}.
          </Text>
        )}

        {st.kind === 'refining' && <Text color="warning">Refining prompt…</Text>}
        {st.kind === 'error' && <Text color="error">Error: {st.message}</Text>}

        {!r && st.kind !== 'refining' && (
          <Text dimColor>No refined prompt yet. Run /refine with a prompt, or type a draft and press Refine draft.</Text>
        )}

        {r && (
          <Box flexDirection="column" gap={1}>
            <Text bold color="claude">{r.title}</Text>
            {SECTIONS.filter(s => r.sections[s.key].length > 0).map(s => (
              <Box key={s.key} flexDirection="column">
                <Text bold>{s.title}</Text>
                {r.sections[s.key].map(item => (
                  <Text>  • {item}</Text>
                ))}
              </Box>
            ))}
          </Box>
        )}

        <Box flexDirection="row" gap={1} flexWrap="wrap">
          {pending && r && (
            <Button key="approve" label="Approve & start intake" hotkey="s" variant="primary" onPress={() => approveIntake($)} />
          )}
          {pending && r && (
            <Button key="revise" label="Revise" hotkey="e" onPress={() => $.prompt.fill({ text: '/refine-intake ' })} />
          )}
          {pending && <Button key="skip" label="Start without refining" hotkey="o" onPress={() => skipIntakeRefine($)} />}
          {pending && <Button key="cancel" label="Cancel intake" hotkey="d" onPress={() => cancelIntake($)} />}
          {!pending && r && <Button key="send" label="Send" hotkey="s" variant="primary" onPress={() => send($)} />}
          {!pending && r && <Button key="edit" label="Edit in prompt" hotkey="e" onPress={() => edit($)} />}
          {!pending && r && <Button key="discard" label="Discard" hotkey="d" onPress={() => update($, refined, () => null)} />}
          {!pending && <Button key="draft" label="Refine draft" hotkey="r" onPress={() => refineDraft($, model)} />}
          <Button key="auto" label={auto ? 'Auto: on' : 'Auto: off'} hotkey="a" onPress={() => update($, isAuto, v => !v)} />
          <Button
            key="rescan"
            label="Rescan"
            dimColor
            onPress={async () => {
              const fresh = await scanWorkspace($, ws.cwd)
              await update($, workspace, () => fresh)
            }}
          />
        </Box>
      </Box>
    )
  })
}

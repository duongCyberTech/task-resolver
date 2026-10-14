import { expect, mock, test } from 'claude-code/testing'

import { REFINED_FILE, REQUIREMENTS_INDEX, requirementText } from '../hooks/intake'

const REPLY = JSON.stringify({
  title: 'Add CSV export',
  requirements: ['Add an Export button to the candidates page'],
  objectives: ['Recruiters can download candidates as CSV'],
  environment: [],
  constraints: ['Do not change the database schema'],
  rules: [],
})

const USAGE = { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

const PANE_PROPS = {
  title: 'Workspace',
  isFocused: true,
  bodyColumns: 80,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
} as const

test('requirementText joins the index, typed args and notes; empty when nothing was given', () => {
  expect(requirementText(null, '  ')).toBe('')
  const text = requirementText('Export candidates', 'csv-export', 'keep it small')
  expect(text).toContain(REQUIREMENTS_INDEX)
  expect(text).toContain('csv-export')
  expect(text).toContain('keep it small')
})

for (const [surface, command] of [['terminal', 'task-resolver:start'], ['desktop', 'trlr:start']] as const) {
  test(`/${command} pauses for review, Approve writes refined.md and runs intake (${surface})`, async ($, on) => {
    const clock = mock.clock(on)
    const prompts: string[] = []
    on('model.complete', async (_$, e) => {
      prompts.push(e.prompt)
      return { value: { isAnswered: true as const, text: REPLY, usage: USAGE } }
    })
    on('ui.open', async () => ({ value: { isPlaced: true as const } }))
    on('fs.read', async (_$, e) => ({ value: e.path.endsWith(REQUIREMENTS_INDEX) ? 'Export candidates as CSV' : '' }))
    on('fs.exists', async () => ({ value: false }))
    const written: { path: string; text: string }[] = []
    on('fs.write', async (_$, e) => {
      written.push(e)
      return { value: undefined }
    })
    const ran: string[] = []
    on('command.run', async (_$, e) => {
      ran.push(`${e.command} ${e.args}`)
      return { text: 'intake ran' }
    })

    const paused = await $.command.run({
      command,
      args: 'csv-export',
      origin: { kind: 'composer' },
      presentation: { isFullscreen: true, columns: 160 },
    })
    expect(paused.text).toContain('Intake paused')
    expect(ran).toHaveLength(0)
    await clock.advance(0)

    const ui = await $.ui.mount({
      plugin: 'prompt-workspace',
      surface,
      component: 'Pane',
      requestId: 'prompt-workspace',
      props: PANE_PROPS,
    })
    expect(prompts[0]).toContain('Export candidates as CSV')
    expect(await ui.find({ text: 'Add CSV export' })).toBeDefined()
    expect(await ui.find({ key: 'send' })).toBeUndefined()

    await ui.press({ key: 'approve' })
    expect(written).toHaveLength(1)
    expect(written[0]!.path.endsWith(REFINED_FILE)).toBe(true)
    expect(written[0]!.text).toContain('## Constraints\n- Do not change the database schema')
    expect(ran).toEqual([`${command} csv-export`])
    expect(await ui.find({ key: 'approve' })).toBeUndefined()
  })
}

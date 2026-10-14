import { expect, test } from 'claude-code/testing'

import { parseRefined, toMarkdown } from '../hooks/refine'

const REPLY = JSON.stringify({
  title: 'Add CSV export',
  requirements: ['Add an Export button to the candidates page'],
  objectives: ['Recruiters can download candidates as CSV'],
  environment: ['Rails app run via docker compose'],
  constraints: ['Do not change the database schema'],
  rules: ['Run tests after applying changes'],
})

const USAGE = { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

test('parses a fenced reply and renders sections in the asked order', () => {
  const r = parseRefined('export csv', 'Here you go:\n```json\n' + REPLY + '\n```')
  expect(r?.title).toBe('Add CSV export')
  const md = toMarkdown(r!)
  const order = ['Requirements', 'Objectives', 'Environment', 'Constraints', 'Rules'].map(h => md.indexOf(`## ${h}`))
  expect(order.every((at, i) => at > 0 && (i === 0 || at > order[i - 1]!))).toBe(true)
})

test('rejects replies with no JSON or only empty sections', () => {
  expect(parseRefined('x', 'sorry, no')).toBe(null)
  expect(parseRefined('x', '{"title":"t","requirements":[]}')).toBe(null)
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`/refine fills the Workspace pane and Send submits it (${surface})`, async ($, on) => {
    on('model.complete', async () => ({ value: { isAnswered: true as const, text: REPLY, usage: USAGE } }))
    on('ui.open', async () => ({ value: { isPlaced: true as const } }))
    const submitted: string[] = []
    on('prompt.submit', async (_$, e) => {
      submitted.push(e.text)
      return { text: e.text }
    })

    await $.command.run({
      command: 'refine',
      args: 'add csv export to candidates page',
      origin: { kind: 'composer' },
      presentation: { isFullscreen: true, columns: 160 },
    })

    const ui = await $.ui.mount({
      plugin: 'prompt-workspace',
      surface,
      component: 'Pane',
      requestId: 'prompt-workspace',
      props: {
        title: 'Workspace',
        isFocused: true,
        bodyColumns: 80,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 40 },
        view: {},
      },
    })
    expect(await ui.find({ text: 'Add CSV export' })).toBeDefined()
    expect(await ui.find({ text: 'Constraints' })).toBeDefined()

    await ui.press({ key: 'send' })
    expect(submitted).toHaveLength(1)
    expect(submitted[0]).toContain('## Rules\n- Run tests after applying changes')
    expect(await ui.find({ key: 'send' })).toBeUndefined()
  })
}

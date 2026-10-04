import type { RenderElement } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'note',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const typed = (args: string) => ({
  command: 'note',
  args,
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 120 },
}) as const

test('/note pins a boxed note and /note alone clears it', async ($, on) => {
  on('ui.render', ($, e) => h($.ui.resolve(e).Box, {}) as RenderElement)

  for (const surface of ['terminal', 'desktop'] as const) {
    const set = await $.command.run(typed('  check the header spacing '))
    expect(set.text).toBe('Note pinned.')

    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ type: 'Text', text: 'check the header spacing' })).toBeDefined()
    expect(await ui.drawn()).toMatchObject({
      type: 'Box',
      props: { borderStyle: 'round', borderColor: 'yellow' },
    })

    const cleared = await $.command.run(typed(''))
    expect(cleared.text).toBe('Note cleared.')
    expect(await ui.find({ type: 'Text', text: /header/ })).toBeUndefined()
    await ui.unmount()
  }
})

test('+ appends a line and #color sets the border', async ($, on) => {
  on('ui.render', ($, e) => h($.ui.resolve(e).Box, {}) as RenderElement)

  for (const surface of ['terminal', 'desktop'] as const) {
    await $.command.run(typed('#red waiting on client reply'))
    expect((await $.command.run(typed('+ then check the footer'))).text).toBe('Line added to the note.')

    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ type: 'Text', text: 'waiting on client reply' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'then check the footer' })).toBeDefined()
    expect(await ui.drawn()).toMatchObject({ props: { borderColor: 'red' } })

    expect((await $.command.run(typed('#CYAN'))).text).toBe('Note color set to cyan.')
    expect(await ui.drawn()).toMatchObject({ props: { borderColor: 'cyan' } })
    expect(await ui.find({ type: 'Text', text: 'waiting on client reply' })).toBeDefined()

    await $.command.run(typed('#123 is broken'))
    expect(await ui.find({ type: 'Text', text: '#123 is broken' })).toBeDefined()
    expect(await ui.drawn()).toMatchObject({ props: { borderColor: 'cyan' } })

    expect((await $.command.run(typed('+'))).text).toBe('Nothing to append.')

    await $.command.run(typed(''))
    await $.command.run(typed('+ fresh start'))
    expect(await ui.find({ type: 'Text', text: 'fresh start' })).toBeDefined()
    expect(await ui.drawn()).toMatchObject({ props: { borderColor: 'yellow' } })

    await $.command.run(typed(''))
    await ui.unmount()
  }
})

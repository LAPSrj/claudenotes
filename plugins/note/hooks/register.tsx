import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { NoteColor } from '../types'

const COLORS: readonly NoteColor[] = ['yellow', 'cyan', 'magenta', 'green', 'red']
const DEFAULT_COLOR: NoteColor = 'yellow'

const note = atom({ plugin: 'note', key: 'text' } as const, '')
const color = atom({ plugin: 'note', key: 'color' } as const, DEFAULT_COLOR)

// Splits "/note [+] [#color] [text]" into its parts. A "#word" that isn't one
// of COLORS stays part of the text.
const parse = (args: string) => {
  let rest = args.trim()
  const isAppend = rest.startsWith('+')
  if (isAppend) {
    rest = rest.slice(1).trim()
  }

  const tag = /^#(\w+)(?:\s+|$)/.exec(rest)
  const name = tag?.[1]?.toLowerCase()
  const picked = COLORS.find(one => one === name)
  if (tag && picked) {
    rest = rest.slice(tag[0].length)
  }

  return { isAppend, color: picked, text: rest.trim() }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'note',
      description: 'Pin a note above the prompt; + appends a line, #color sets the border; /note alone clears it',
      argumentHint: '[+] [#yellow|#cyan|#magenta|#green|#red] [text]',
      immediate: true,
    })

    return next(e)
  })

  on('command.run', { command: 'note' }, async ($, e) => {
    const args = (e.args ?? '').trim()

    if (!args) {
      await update($, note, () => '')
      await update($, color, () => DEFAULT_COLOR)

      return { text: 'Note cleared.' }
    }

    const parsed = parse(args)
    if (parsed.color) {
      await update($, color, () => parsed.color ?? DEFAULT_COLOR)
    }

    if (!parsed.text) {
      if (parsed.color) {
        return { text: `Note color set to ${parsed.color}.` }
      }

      return { text: 'Nothing to append.' }
    }

    if (parsed.isAppend) {
      await update($, note, current => (current ? `${current}\n${parsed.text}` : parsed.text))

      return { text: 'Line added to the note.' }
    }

    await update($, note, () => parsed.text)

    return { text: 'Note pinned.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const text = await read($, note)

    if (!text || e.props.hasSurvey) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" borderStyle="round" borderColor={await read($, color)} paddingX={1}>
        {text.split('\n').map(line => (
          <Text>{line}</Text>
        ))}
      </Box>
    )
  })
}

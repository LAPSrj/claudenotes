export type NoteText = string
export type NoteColor = 'yellow' | 'cyan' | 'magenta' | 'green' | 'red'

declare module 'claude-code' {
  interface PluginState {
    note: { text: NoteText; color: NoteColor }
  }
}

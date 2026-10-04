# claudenotes

A sticky note for your Claude Code sessions.

When you run several Claude Code sessions at once, or come back to one after a break, it's easy to lose track of what that conversation was about. `/note` pins a short note in a box right above the prompt, so the context is the first thing you see:

```
╭──────────────────────────────────────────────╮
│ Agent is refactoring the checkout flow       │
│ Next: check the header spacing on mobile     │
╰──────────────────────────────────────────────╯
> _
```

The note stays above the prompt until you clear it or the session ends.

## Install

In a terminal, add this repo as a plugin marketplace and install the plugin:

```sh
claude plugin marketplace add LAPSrj/claudenotes
claude plugin install note@claudenotes
```

Start a new Claude Code session, and `/note` shows up in the command menu.

To try it without installing, start a session with the plugin folder loaded:

```sh
git clone https://github.com/LAPSrj/claudenotes.git
claude --plugin-dir ./claudenotes/plugins/note
```

## Usage

| Command | What it does |
| --- | --- |
| `/note <text>` | Pins the text above the prompt, replacing any current note |
| `/note + <text>` | Adds the text as a new line under the current note |
| `/note #<color> <text>` | Pins the text with a colored border |
| `/note #<color>` | Changes the border color and keeps the text |
| `/note` | Clears the note and resets the color to yellow |

The border colors are `yellow` (the default), `cyan`, `magenta`, `green`, and `red`. A `#word` that isn't one of these colors stays in the note as text, so `/note #123 is broken` pins "#123 is broken".

Some examples:

```
/note waiting on the deploy, then check the header spacing
/note + also ask about the footer links
/note #red blocked on the client's API key
/note #green
```

You can run `/note` while Claude is working, and it doesn't interrupt the current turn.

Notes last for the current session only. A new session, or one you reopen with `--resume`, starts without a note.

## Development

The plugin is in [`plugins/note`](plugins/note). Its hooks module is `hooks/register.tsx`, and the tests are in `tests/`.

```sh
claude plugin validate plugins/note
claude plugin test plugins/note
```

To work on it with live reloading, start Claude Code with `claude --plugin-dir plugins/note`. The session reloads the plugin each time you save a file.

## Requirements

The plugin is built and tested on Claude Code 2.1.289. It uses the plugin hooks API, which is in early access and may change between releases. The note shows in the terminal and in the desktop app's Code tab.

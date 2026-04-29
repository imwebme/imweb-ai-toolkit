# AI Agent Installation

This guide is the canonical install path when a user asks an AI coding agent to install `imweb-ai-toolkit`.

The agent should prefer the `npx` command because it can run directly from the public GitHub repository without a prior clone. The installer registers the durable public Git repository as the marketplace source, not the temporary `npx` package directory.

## Quick Install

Codex:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool codex --scope user
```

Claude Code:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude --scope user
```

Codex and Claude Code together:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

Equivalent `npm exec` form:

```bash
npm exec --yes --package github:imwebme/imweb-ai-toolkit -- imweb-ai-toolkit --tool both --scope user
```

If the `imweb` CLI itself also needs to be installed or updated, add `--install-cli`:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user --install-cli
```

## What The Installer Does

- Creates a timestamped backup under `~/.imweb-ai-toolkit-local-install-backups/`.
- Registers `https://github.com/imwebme/imweb-ai-toolkit.git` as the marketplace source.
- For Codex, registers the marketplace and copies `skills/imweb` into the user skill discovery path so CLI discovery works without waiting for a Plugins UI install.
- For Claude Code, installs `imweb-ai-toolkit@imweb-ai-toolkit` in user scope.
- Replaces existing `imweb-ai-toolkit` marketplace/plugin entries by default while preserving Claude plugin data.

Use `--no-replace` to avoid replacing existing entries. Use `--no-backup` only in disposable automation environments.

## Verification

After installing, run:

```bash
imweb --output json config context
imweb --output json config command-capabilities
```

Codex verification:

```bash
test -f "$HOME/.codex/skills/imweb/SKILL.md"
codex exec --ephemeral -s read-only 'If the imweb skill is visible, answer: IMWEB_SKILL_VISIBLE'
```

Claude Code verification:

```bash
claude plugin list --json --available
claude -p --no-session-persistence '/imweb Answer exactly: IMWEB_CLAUDE_PLUGIN_VISIBLE'
```

Expected high-level result:

- Codex has an `imweb` skill at `~/.codex/skills/imweb/SKILL.md`.
- Claude Code lists `imweb-ai-toolkit@imweb-ai-toolkit` as installed and enabled.
- The two `imweb --output json config ...` commands return valid JSON.

## Claude Desktop Cowork

For Claude Desktop Cowork custom upload, ask the agent to create the zip:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --package imweb-ai-toolkit-plugin.zip
```

Then upload the zip in Claude Desktop Cowork using the custom plugin upload flow.

## Manual Clone Fallback

If `npx` or `npm exec` is unavailable, use a manual public clone:

```bash
git clone https://github.com/imwebme/imweb-ai-toolkit.git
cd imweb-ai-toolkit
./install/install-plugins.sh --tool codex
./install/install-skills.sh --tool codex --scope user --mode copy
./install/install-plugins.sh --tool claude --scope user
```

For manual clones, `--mode symlink` is acceptable during development. For `npx`, keep the default `copy` mode because the package execution directory is temporary.

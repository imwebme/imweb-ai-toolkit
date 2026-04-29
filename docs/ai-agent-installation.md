# AI Agent Installation

This guide is the canonical install path when a user asks an AI coding agent to install `imweb-ai-toolkit`.

The agent should prefer tool-native plugin installation where the target tool supports it. Use the public `npx` installer when the user wants one command that handles Codex and Claude Code local configuration without a prior clone. The installer registers the durable public Git repository as the marketplace source, not the temporary `npx` package directory.

Install model:

- Plugin first for Claude Code and Codex marketplace registration.
- Standard Agent Skills fallback with `npx skills add` when a tool only needs the `imweb` skill files.
- Installable `.plugin` package generation for Claude Desktop Cowork. A Cowork task should not use computer-use or UI automation to install itself.
- MCP is not bundled by this repository today.

## Quick Install

Claude Code plugin, tool-native:

```bash
claude plugin marketplace add imwebme/imweb-ai-toolkit --scope user
claude plugin install imweb-ai-toolkit@imweb-ai-toolkit --scope user
```

Claude Code chat form:

```text
/plugin marketplace add imwebme/imweb-ai-toolkit
/plugin install imweb-ai-toolkit@imweb-ai-toolkit
```

Codex:

```bash
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

Codex currently uses the Plugins UI after marketplace registration. For immediate CLI skill discovery, also run:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool codex --scope user
```

Standard Agent Skills fallback:

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

Codex and Claude Code together:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

Claude Desktop Cowork plugin setup:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

This creates `imweb-ai-toolkit.plugin` and fallback `imweb-skill.zip` in the task folder. Claude should verify the package contents, then present `imweb-ai-toolkit.plugin` as the installable Cowork plugin artifact. Do not ask Claude to open Customize, Settings, Skills, Plugins, or any Claude Desktop UI through computer-use.

Claude Desktop plugin package only:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-desktop
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

- Creates a timestamped backup under `~/.imweb-ai-toolkit-local-install-backups/` when it changes Codex or Claude Code local config. Package-only Claude Desktop Cowork runs do not create a backup.
- Registers `https://github.com/imwebme/imweb-ai-toolkit.git` as the marketplace source.
- For Codex, registers the marketplace and copies `skills/imweb` into the user skill discovery path so CLI discovery works without waiting for a Plugins UI install.
- For Claude Code, installs `imweb-ai-toolkit@imweb-ai-toolkit` in user scope.
- For Claude Desktop Cowork plugin workflows, creates `imweb-ai-toolkit.plugin` in the directory where the agent ran the command.
- For Claude Cowork fallback packaging, creates `imweb-skill.zip`, a custom Skill package whose root folder is `imweb/` and whose entrypoint is `SKILL.md`.
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
claude -p --no-session-persistence '/imweb-ai-toolkit:imweb imweb CLI command discovery entrypoint를 한 문장으로 설명해줘.'
```

For non-interactive smoke tests that must prove bundled skill files are readable,
allow Claude Code's `Read` tool and add the installed plugin cache directory:

```bash
PLUGIN_DIR="$(claude plugin list --json --available | jq -r '.installed[] | select(.id == "imweb-ai-toolkit@imweb-ai-toolkit") | .installPath')"
printf '%s\n' '/imweb-ai-toolkit:imweb docs/capability-registry.md 파일의 첫 번째 H1 제목만 알려줘. 명령 실행은 하지 마.' \
  | claude -p --no-session-persistence --tools Read --allowedTools Read --add-dir "$PLUGIN_DIR"
```

Expected high-level result:

- Codex has an `imweb` skill at `~/.codex/skills/imweb/SKILL.md`.
- Claude Code lists `imweb-ai-toolkit@imweb-ai-toolkit` as installed and enabled.
- The Claude Code file-read smoke returns `capability registry`.
- Claude Cowork package generation creates a verified `imweb-ai-toolkit.plugin`; the installed Cowork plugin is the intended path for `/imweb` to appear in the slash menu.
- The two `imweb --output json config ...` commands return valid JSON.

## Claude Desktop Cowork

Claude Desktop Cowork does not read the Claude Code CLI plugin registry or `~/.claude/skills` directly. It needs its own Cowork plugin or organization provisioning path.

For the `/imweb` slash entrypoint, ask Claude to create and verify the Cowork plugin package:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

This creates:

- `imweb-ai-toolkit.plugin`: installable Cowork plugin package. This is the primary artifact.
- `imweb-skill.zip`: fallback custom Skill package.

The exact prompt to give Claude is in [cowork-ask-claude-install.md](./cowork-ask-claude-install.md).

The prompt explicitly tells Claude not to use computer-use or UI automation. Claude should present `imweb-ai-toolkit.plugin` so the Cowork host can install and enable the plugin. If the host requires confirmation, the user only approves the presented plugin card; they should not be sent to a manual builder or settings flow.

Local dogfood on 2026-04-29 observed Claude Desktop Cowork mounting `/mnt/.claude/skills/` read-only. The supported no-UI path is therefore the `.plugin` artifact, not writing into that mount.

For Claude Desktop Cowork plugin package generation only, run:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Then present or provision `imweb-ai-toolkit.plugin` using a supported Cowork plugin flow. If a Team or Enterprise workspace restricts personal plugin installs, the same `.plugin` artifact is the package to hand to the workspace admin.

If an explicit package path is needed, pass an absolute path or a path relative to the directory where the agent runs:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --package "$PWD/imweb-ai-toolkit.plugin"
```

## Manual Clone Fallback

If `npx` or `npm exec` is unavailable, use a manual public clone:

```bash
git clone https://github.com/imwebme/imweb-ai-toolkit.git
cd imweb-ai-toolkit
./install/install-plugins.sh --tool codex
./install/install-skills.sh --tool codex --scope user --mode copy
./install/install-plugins.sh --tool claude --scope user
./install/install-plugins.sh --package imweb-ai-toolkit.plugin
```

For manual clones, `--mode symlink` is acceptable during development. For `npx`, keep the default `copy` mode because the package execution directory is temporary.

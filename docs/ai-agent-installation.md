# AI Agent Installation

This guide is the canonical install path when a user asks an AI coding agent to install `imweb-ai-toolkit`.

The agent should prefer tool-native plugin installation where the target tool supports it. Use the public `npx` installer when the user wants one short command that handles Codex and Claude Code local configuration without a prior clone. The installer registers the durable public Git repository as the marketplace source, not the temporary `npx` package directory.

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
npx -y github:imwebme/imweb-ai-toolkit --tool codex
```

Standard Agent Skills fallback:

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

Codex and Claude Code together:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool both
```

Claude Desktop Cowork plugin setup:

```text
Install imweb AI toolkit:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
Present imweb-ai-toolkit.plugin and imweb.skill so I can save them.
```

This creates `imweb-ai-toolkit.plugin` and `imweb.skill` in the task folder. Claude should verify the package contents, then present both artifacts as installable Cowork cards. Do not ask Claude to open Customize, Settings, Skills, Plugins, or any Claude Desktop UI through computer-use.

After the Cowork host installs and enables the presented plugin and skill, start with `/imweb 주문목록을 확인해줘` or another natural-language imweb request. The plugin package includes `commands/imweb.md` plus a local `imweb-cli` MCP bridge, so Cowork can route the short `/imweb` slash request to the host `imweb` CLI and auth state instead of installing the CLI inside the task VM. If auth is missing or expired, Claude should use the bundled auth MCP tools to open the browser login flow, ask the user to complete the browser login, re-check auth, and continue the original task. The skill package keeps the same imweb instructions available as a custom Skill fallback.

Claude Desktop plugin package only:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Equivalent `npm exec` form:

```bash
npm exec --yes --package github:imwebme/imweb-ai-toolkit -- imweb-ai-toolkit --tool both --scope user
```

If the `imweb` CLI itself also needs to be installed or updated, add `--install-cli`:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool both --install-cli
```

CLI only:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

## What The Installer Does

- Creates a timestamped backup under `~/.imweb-ai-toolkit-local-install-backups/` when it changes Codex or Claude Code local config. Package-only Claude Desktop Cowork runs do not create a backup.
- Registers `https://github.com/imwebme/imweb-ai-toolkit.git` as the marketplace source.
- For CLI-only setup, installs or updates the official `imweb` CLI from the public release channel.
- For Codex, registers the marketplace and copies `skills/imweb` into the user skill discovery path so CLI discovery works without waiting for a Plugins UI install.
- For Claude Code, installs `imweb-ai-toolkit@imweb-ai-toolkit` in user scope.
- For Claude Desktop Cowork plugin workflows, creates `imweb-ai-toolkit.plugin` in the directory where the agent ran the command. The plugin package includes `commands/imweb.md`, `.mcp.json`, `bin/imweb-mcp.mjs`, and `skills/imweb/`.
- For Claude Cowork skill packaging, creates `imweb.skill`, a custom Skill package whose root folder is `imweb/` and whose entrypoint is `SKILL.md`.
- Replaces existing `imweb-ai-toolkit` marketplace/plugin entries by default while preserving Claude plugin data.

Use `--no-replace` to avoid replacing existing entries. Use `--no-backup` only in disposable automation environments.

## Verification

After installing, run:

```bash
command -v imweb
imweb --version
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

The namespaced `/imweb-ai-toolkit:imweb` form is the deterministic plugin skill smoke entry for Claude Code. Claude Desktop Cowork should use the short `/imweb` entrypoint after the `imweb-ai-toolkit.plugin` card is installed.

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
- Claude Cowork package generation creates a verified `imweb-ai-toolkit.plugin` and `imweb.skill`; after the Cowork host installs/enables those cards, `/imweb 주문목록을 확인해줘` or a natural-language imweb request is the intended entry.
- The two `imweb --output json config ...` commands return valid JSON.

## Claude Desktop Cowork

Claude Desktop Cowork does not read the Claude Code CLI plugin registry or `~/.claude/skills` directly. It needs its own Cowork plugin or organization provisioning path.

For the Cowork entrypoint, ask Claude to create and verify the Cowork plugin package:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

This creates:

- `imweb-ai-toolkit.plugin`: installable Cowork plugin package with `commands/imweb.md` and the local MCP bridge.
- `imweb.skill`: installable custom Skill package that provides the same imweb instructions as a fallback Skill.

The exact prompt to give Claude is in [cowork-ask-claude-install.md](./cowork-ask-claude-install.md).

The prompt explicitly tells Claude not to use computer-use or UI automation. Claude should present `imweb-ai-toolkit.plugin` and `imweb.skill` so the Cowork host can install and enable both. If the host requires confirmation, the user only approves the presented install cards; they should not be sent to a manual builder or settings flow.

Local dogfood on 2026-04-29 observed Claude Desktop Cowork mounting `/mnt/.claude/skills/` read-only. The supported no-UI path is therefore presenting installable `.plugin` and `.skill` artifacts, not writing into that mount.

Local dogfood on 2026-04-30 showed that `imweb.skill` alone can be saved and enabled while bare `/imweb` is still rejected by Cowork slash routing. The supported package therefore includes the explicit plugin slash command `commands/imweb.md` alongside the custom Skill fallback. After the plugin and skill cards are accepted, use `/imweb 주문목록을 확인해줘` or ask naturally for an imweb task. The bundled local MCP bridge is the supported path for host CLI/auth access.

For Claude Desktop Cowork plugin package generation only, run:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Then present or provision `imweb-ai-toolkit.plugin` using a supported Cowork plugin flow. If a Team or Enterprise workspace restricts personal plugin installs, the same `.plugin` artifact is the package to hand to the workspace admin.

If an explicit package path is needed, pass an absolute path or a path relative to the directory where the agent runs:

```bash
npx -y github:imwebme/imweb-ai-toolkit --package "$PWD/imweb-ai-toolkit.plugin"
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

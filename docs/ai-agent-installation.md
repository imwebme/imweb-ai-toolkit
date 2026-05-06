# AI Agent Installation

This guide is the canonical install path when a user asks an AI coding agent to install `imweb-ai-toolkit`.

The agent should prefer tool-native plugin installation where the target tool supports it. Use the public `npx` installer when the user wants one short command that handles Codex and Claude Code local configuration without a prior clone. The installer registers the durable public Git repository as the marketplace source, not the temporary `npx` package directory.

Install model:

- Plugin first for Claude Code and Codex marketplace registration.
- Plugin install paths also install or update the official `imweb` CLI by default.
- Standard Agent Skills fallback with `npx skills add` when a tool only needs the `imweb` skill files.
- Installable `.mcpb` bundle generation for Claude Desktop local MCP. The bundle bridge manages host CLI install/update on first use.
- Installable `.plugin` package generation for Claude Desktop Cowork. A Cowork task should not use computer-use or UI automation to install itself.
- Claude Desktop Cowork packages include a local MCP bridge for hosts that expose Cowork plugin MCP tools. When those tools are not visible, Claude must present the package artifacts instead of installing a VM-only CLI for real user data.

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
Install the imweb tool package:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
Present imweb-ai-toolkit.plugin and imweb.skill so I can save them.
```

This creates `imweb-ai-toolkit.plugin` and `imweb.skill` in the task folder. Claude should verify the package contents, then present both artifacts as installable Cowork cards. Do not ask Claude to open Customize, Settings, Skills, Plugins, or any Claude Desktop UI through computer-use.

After the Cowork host installs and enables the presented plugin and skill, start with a natural-language business request such as `Use imweb tool to investigate suspicious recent orders.` or `Use imweb tool to get the top 5 products with the most visitors and review their detail pages as far as possible.` Short names such as `imweb tool`, `imweb tools`, and `imweb toolkit` should route to the same imweb entrypoint. The plugin package includes `commands/imweb.md` plus a local `imweb-cli` MCP bridge for hosts that expose plugin MCP tools. Current Claude Desktop Cowork builds may reject slash-form text such as `/imweb` before the task starts, even when the skill is enabled; treat that as a platform routing limitation and retry with the natural-language request. Do not ask the user to run Terminal commands or use computer-use for normal setup. If Claude Desktop asks for imweb tool permission, click `Allow for this task`. If auth is missing or expired and MCP tools are visible, Claude should use the bundled auth MCP tools to open the browser login flow, ask the user to complete the browser login, re-check auth, and continue the original task. The skill package keeps the same imweb instructions available as a custom Skill fallback.

For non-technical users, keep the prompt business-oriented after setup. Good smoke prompts are:

- `Use imweb tool to investigate suspicious recent orders.`
- `Use imweb tools to check recent orders for unusual payment or cancellation signals.`
- `Use imweb tool to get the top 5 products with the most visitors and review their detail pages as far as possible.`
- `Use imweb toolkit to inspect high-traffic products within the currently available CLI data.`

If the request asks for a metric the CLI does not expose, such as visitor-ranked products, Claude should say that the current CLI cannot read visitor/traffic ranking yet and continue with the closest supported read-only check, such as product list, product details, reviews, site info, or recent orders.

Claude Desktop MCPB bundle only:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

This creates `imweb-ai-toolkit.mcpb` for Claude Desktop local MCP. Open the bundle with Claude Desktop and click Install. The bundle includes the same local MCP bridge, so the first imweb tool use can install or update the official host CLI and then reuse local auth.

Equivalent `npm exec` form:

```bash
npm exec --yes --package github:imwebme/imweb-ai-toolkit -- imweb-ai-toolkit --tool both --scope user
```

CLI only:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

If an agent is running inside a sandbox or task VM and no host MCP bridge is available, it may need to install the CLI inside that runtime. Use the same CLI-only command above, then run `imweb --output json auth status`, `imweb --output json auth doctor`, and `imweb --output json auth login` if login is needed. The user should only be asked to complete the browser login or click a visible allow button.

## Quick Uninstall

For Codex and Claude Code local setup:

```bash
npx -y github:imwebme/imweb-ai-toolkit --uninstall --tool both
```

For the generated Desktop/Cowork artifacts plus the installer-managed CLI:

```bash
npx -y github:imwebme/imweb-ai-toolkit --uninstall --tool all
```

Use `--tool cli` to remove only the installer-managed `imweb` CLI, or `--tool claude-cowork` / `--tool claude-desktop` from the folder where the package artifacts were created to remove those generated files. Add `--keep-cli` when removing plugin wiring but keeping the CLI. The uninstall path removes toolkit-owned plugin cache/data, but does not delete imweb login or auth data.

## What The Installer Does

- Creates a timestamped backup under `~/.imweb-ai-toolkit-local-install-backups/` when it changes Codex or Claude Code local config. Package-only Claude Desktop and Cowork runs do not create a backup.
- Registers `https://github.com/imwebme/imweb-ai-toolkit.git` as the marketplace source.
- Installs or updates the official `imweb` CLI from the public release channel for CLI-only, Codex, Claude Code, and combined local installs.
- For Codex, registers the marketplace and copies `skills/imweb` into the user skill discovery path so CLI discovery works without waiting for a Plugins UI install.
- For Claude Code, installs `imweb-ai-toolkit@imweb-ai-toolkit` in user scope.
- For Claude Desktop local MCP, creates `imweb-ai-toolkit.mcpb`, a bundle with `manifest.json`, `bin/imweb-mcp.mjs`, and the CLI installer/update scripts.
- For Claude Desktop Cowork plugin workflows, creates `imweb-ai-toolkit.plugin` in the directory where the agent ran the command. The plugin package includes `commands/imweb.md`, `.mcp.json`, `bin/imweb-mcp.mjs`, and `skills/imweb/`. The MCP bridge exposes read-only setup/auth/context/order/product/member/promotion/community tools plus plugin-managed CLI install/update and auth tools for onboarding.
- For Claude Cowork skill packaging, creates `imweb.skill`, a custom Skill package whose root folder is `imweb/` and whose entrypoint is `SKILL.md`.
- Replaces existing `imweb-ai-toolkit` marketplace/plugin entries by default while preserving imweb login/auth data.
- With `--uninstall`, removes toolkit marketplace/plugin wiring, copied `imweb` skills, toolkit-owned plugin cache/data, generated package artifacts, and the installer-managed CLI when the selected tool owns that CLI path. It keeps imweb login and auth data.

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
claude -p --no-session-persistence '/imweb-ai-toolkit:imweb Explain the imweb CLI command discovery entrypoint in one sentence.'
```

The namespaced `/imweb-ai-toolkit:imweb` form is the deterministic plugin skill smoke entry for Claude Code. Claude Desktop Cowork should use natural-language business prompts after the `imweb-ai-toolkit.plugin` and `imweb.skill` cards are installed; current Desktop Cowork builds may reject slash-form text before the task starts.

For non-interactive smoke tests that must prove bundled skill files are readable,
allow Claude Code's `Read` tool and add the installed plugin cache directory:

```bash
PLUGIN_DIR="$(claude plugin list --json --available | jq -r '.installed[] | select(.id == "imweb-ai-toolkit@imweb-ai-toolkit") | .installPath')"
printf '%s\n' '/imweb-ai-toolkit:imweb Tell me only the first H1 title in docs/capability-registry.md. Do not run commands.' \
  | claude -p --no-session-persistence --tools Read --allowedTools Read --add-dir "$PLUGIN_DIR"
```

Expected high-level result:

- Codex has an `imweb` skill at `~/.codex/skills/imweb/SKILL.md`.
- Claude Code lists `imweb-ai-toolkit@imweb-ai-toolkit` as installed and enabled.
- The Claude Code file-read smoke returns `capability registry`.
- Claude Desktop package generation creates a verified `imweb-ai-toolkit.mcpb` whose `manifest.json` points at `bin/imweb-mcp.mjs`.
- Claude Cowork package generation creates a verified `imweb-ai-toolkit.plugin` and `imweb.skill`; after the Cowork host installs/enables those cards, natural-language imweb business requests are the intended entry. Slash-form `/imweb` is only supported where the host plugin surface routes it.
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

Local dogfood on 2026-04-30 showed that `imweb.skill` alone can be saved and enabled while bare `/imweb` is still rejected by Cowork slash routing. A later Desktop test also rejected `/imweb-ai-toolkit:imweb` in the Cowork start box before the task reached the model. The supported package therefore still includes the explicit plugin slash command `commands/imweb.md` for plugin surfaces, but the Cowork user-facing entry should be natural language: `Use imweb tool to investigate suspicious recent orders.` The bundled local MCP bridge is the supported path for host CLI install/update and auth access when the Cowork host exposes those plugin MCP tools. If the tools are not visible, Claude should report that the host plugin connection is not active and present the package artifacts instead of installing a VM-only CLI for real user data.

For Claude Desktop local MCP package generation only, run:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Then open or present `imweb-ai-toolkit.mcpb` using a supported Claude Desktop extension flow. If a Team or Enterprise workspace restricts personal extensions, hand the `.mcpb` artifact to the workspace admin.

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

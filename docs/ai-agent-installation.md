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
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-code --scope user
```

Codex and Claude Code together:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

Claude Desktop Cowork package:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Claude Cowork direct `/imweb` skill package plus plugin package:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
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
- For Claude Desktop Cowork plugin workflows, creates `imweb-ai-toolkit-plugin.zip` in the directory where the agent ran the command.
- For Claude Cowork direct `/imweb`, creates `imweb-skill.zip`, a custom Skill package whose root folder is `imweb/` and whose entrypoint is `SKILL.md`.
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
- Claude Cowork direct Skill upload exposes `/imweb`.
- The two `imweb --output json config ...` commands return valid JSON.

## Claude Desktop Cowork

Claude Desktop Cowork does not read the Claude Code CLI plugin registry or `~/.claude/skills` directly. It needs its own Cowork install path.

For the direct `/imweb` slash entrypoint, ask Claude to create and install the Cowork Skill package:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

This creates:

- `imweb-skill.zip`: upload through Customize > Skills for direct `/imweb`.
- `imweb-ai-toolkit-plugin.zip`: optional plugin package for Customize > Plugins or organization marketplaces.

The exact prompt to give Claude is in [cowork-ask-claude-install.md](./cowork-ask-claude-install.md).

For Claude Desktop Cowork custom upload, ask the agent to create the zip:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

Then upload `imweb-ai-toolkit-plugin.zip` in Claude Desktop Cowork using the custom plugin upload flow: Cowork > Customize > Browse plugins > custom plugin file upload. Plugin skills may appear with plugin namespacing, so use `imweb-skill.zip` when the acceptance target is the bare `/imweb` command.

Observed caveat: Claude Desktop 1.5354.0 may show the plugin directory without a personal custom upload action, depending on account or workspace settings. In that case, the zip is still the correct artifact for Team/Enterprise manual marketplace upload. GitHub-synced Cowork organization marketplaces require a private or internal GitHub repository, so the public repo is used for the npx/package path, not as a direct organization marketplace source.

If an explicit package path is needed, pass an absolute path or a path relative to the directory where the agent runs:

```bash
npx --yes github:imwebme/imweb-ai-toolkit --package "$PWD/imweb-ai-toolkit-plugin.zip"
```

## Manual Clone Fallback

If `npx` or `npm exec` is unavailable, use a manual public clone:

```bash
git clone https://github.com/imwebme/imweb-ai-toolkit.git
cd imweb-ai-toolkit
./install/install-plugins.sh --tool codex
./install/install-skills.sh --tool codex --scope user --mode copy
./install/install-plugins.sh --tool claude --scope user
./install/install-plugins.sh --package imweb-ai-toolkit-plugin.zip
```

For manual clones, `--mode symlink` is acceptable during development. For `npx`, keep the default `copy` mode because the package execution directory is temporary.

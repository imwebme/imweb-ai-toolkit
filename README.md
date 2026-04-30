# imweb-ai-toolkit

[한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

`imweb-ai-toolkit` installs the `imweb` CLI and connects it to supported AI coding tools. It provides the skill assets, surface metadata, examples, and bootstrap scripts needed to get started without requiring users to understand the release infrastructure behind the CLI.

```mermaid
flowchart LR
  Toolkit["imweb-ai-toolkit"] --> CLI["imweb-cli"]
  Toolkit --> Codex["Codex"]
  Toolkit --> Claude["Claude"]
  Toolkit --> Cursor["Cursor"]
  Codex --> CLI
  Claude --> CLI
  Cursor --> CLI
```

## What This Repo Contains

- `plugin.json`, marketplace metadata, and surface metadata for Codex, Claude, Cursor, and MCP reference wiring.
- `bin/imweb-mcp.mjs`, a local MCP bridge for Claude Desktop local MCP packages and Cowork package artifacts that installs/updates the host `imweb` CLI when the host exposes the MCP tools.
- `commands/imweb.md`, the short `/imweb` slash-command entrypoint for Claude plugin surfaces.
- `skills/imweb/`, the `imweb` skill bundle and its local docs.
- `install/`, bootstrap and installer scripts for CLI, skill, and plugin setup.
- `docs/`, public usage, integration, and support matrix documentation.
- `examples/`, sample workflows and fixtures.

## Install

- For Claude Code, run these two commands in a Claude Code chat:

```text
/plugin marketplace add imwebme/imweb-ai-toolkit
/plugin install imweb-ai-toolkit@imweb-ai-toolkit
```

- For Codex, register the marketplace, then add `imweb-ai-toolkit` from the Plugins UI:

```bash
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

- For Claude Desktop Cowork, ask Claude in the Cowork task:

```text
Install imweb AI toolkit:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
Present imweb-ai-toolkit.plugin and imweb.skill so I can save them.
```

- For Claude Desktop chat local MCP, create the one-click MCPB bundle:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool claude-desktop
```

- For an AI coding agent installing Codex and Claude Code locally:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool both
```

The local plugin installer installs or updates the official `imweb` CLI by default. The Desktop command creates `imweb-ai-toolkit.mcpb`, a Claude Desktop local MCP bundle. Open it with Claude Desktop and click Install; the bundled MCP bridge manages CLI install/update on first use. The Cowork command creates `imweb-ai-toolkit.plugin` and `imweb.skill`. Accept the presented plugin and skill cards, then use business prompts such as `최근 주문중 이상 거래 조사해줘. imweb AI Toolkit을 사용해줘.` or `방문자 많은 상품 top 5 가져와서 상세페이지 점검해줘. imweb AI Toolkit으로 가능한 범위까지 확인해줘.` Current Claude Desktop Cowork builds may reject slash-form text such as `/imweb` before the task starts, even when the skill is enabled; if that happens, use the natural-language prompt instead. The plugin includes the `/imweb` slash entrypoint for Claude plugin surfaces and a local `imweb-cli` MCP bridge for hosts that expose those tools. If Claude Desktop asks for imweb tool permission, click `Allow for this task`. If the host CLI is not logged in, Claude can start the browser login flow for you; finish the imweb login in the browser, then Claude will re-check auth and continue the original request. If a requested metric is not available through the CLI, Claude should say so and continue with supported read-only checks. The skill package keeps the same imweb instructions available as a custom Skill fallback.

## Other Install Methods

If only the `imweb` CLI binary is missing:

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

If the target tool does not support plugins, install the standard Agent Skill directly:

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

For full installer flags, verification steps, and manual clone fallback, see [docs/ai-agent-installation.md](docs/ai-agent-installation.md). Advanced local or pinned-version setup is documented in [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md).

## Start Here

1. [docs/ai-agent-installation.md](docs/ai-agent-installation.md)
2. [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)
3. [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)
4. [docs/cli-toolkit-integration.md](docs/cli-toolkit-integration.md)
5. [docs/surface-support-matrix.md](docs/surface-support-matrix.md)
6. [skills/imweb/SKILL.md](skills/imweb/SKILL.md)

## Support Scope

Codex App/CLI, Claude Code, Claude Desktop local MCP, and Claude Desktop Cowork are the primary supported surfaces. Cursor remains documented as a limited/manual connection surface. The authoritative support detail is [docs/surface-support-matrix.md](docs/surface-support-matrix.md).

## License

Toolkit assets in this repository are licensed under [Apache-2.0](LICENSE).
Imweb trademarks and brand assets are not licensed by Apache-2.0; see [TRADEMARKS.md](TRADEMARKS.md).

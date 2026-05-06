# Claude Plugin Surface

The Claude surface connects Claude Code and Claude Desktop Cowork through the plugin-first flow. Use [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md) for install details and [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md) for the public support contract.

## What To Check

- Primary Claude surfaces: Claude Code and Claude Desktop Cowork
- Skill assets: `skills/imweb/`
- Canonical entrypoint: `plugin.json`
- Marketplace metadata: `marketplace.json`
- `manifest.json` is kept only as a compatibility entrypoint

## Start Paths

### Claude Code

1. Run `claude plugin marketplace add imwebme/imweb-ai-toolkit --scope user` or `./install/install-plugins.sh --tool claude --scope user`.
2. Run `claude plugin install imweb-ai-toolkit@imweb-ai-toolkit --scope user`.
3. In an existing Claude Code session, run `/reload-plugins` or start a new session.
4. Start with `/imweb-ai-toolkit:imweb` when you need a deterministic plugin smoke entry.

For non-interactive `claude -p` smoke tests, the namespaced slash entry is more deterministic than a general prompt. To verify bundle-local docs, allow the installed plugin cache with `--add-dir` and use the `Read` tool:

```bash
PLUGIN_DIR="$(claude plugin list --json --available | jq -r '.installed[] | select(.id == "imweb-ai-toolkit@imweb-ai-toolkit") | .installPath')"
printf '%s\n' '/imweb-ai-toolkit:imweb Tell me only the first H1 title in docs/capability-registry.md. Do not run commands.' \
  | claude -p --no-session-persistence --tools Read --allowedTools Read --add-dir "$PLUGIN_DIR"
```

### Claude Desktop Cowork

1. Run `./install/install-plugins.sh --package imweb-ai-toolkit.plugin`.
2. Run `./install/install-plugins.sh --skill-package imweb.skill`.
3. Verify that the package contains `.claude-plugin/plugin.json`, `.mcp.json`, `bin/imweb-mcp.mjs`, and `skills/imweb/SKILL.md`.
4. Present the `.plugin` and `.skill` artifacts so the Cowork host can show install cards.
5. After the plugin and skill cards are accepted, start with natural language such as `Use imweb tool to investigate suspicious recent orders.` or `Use imweb tool to get the top 5 products with the most visitors and review their detail pages as far as possible.`

Claude Desktop Cowork does not read Claude Code's `~/.claude/plugins` registry or `~/.claude/skills` directory. Local Desktop verification must use a Cowork install card or an organization deployment path. The Cowork shell can be a VM, so the local MCP bridge inside the plugin should handle host `imweb` CLI install/update and auth/profile reuse. When asking Claude to set up Cowork, do not use computer-use or Claude Desktop UI automation; ask for package creation, verification, and presentation of the `.plugin` and `.skill` artifacts. See [../docs/cowork-ask-claude-install.md](../docs/cowork-ask-claude-install.md).

## Public Scope

This document describes only the public connection assets. The Claude surface uses the plugin manifest, marketplace metadata, package creation flow, public `imweb` skill entrypoint, and support matrix as its source of truth.

## Related Docs

- Root start point: [../README.md](../README.md)
- Install/update contract: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- Support interpretation: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- Public skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

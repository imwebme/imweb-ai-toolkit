# Codex Plugin Surface

The Codex surface connects Codex CLI and Codex App through the same public `imweb` skill bundle. Use [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md) for install flow and execution order, and [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md) for support scope.

## What To Check

- Codex support scope: Codex CLI and Codex App
- Skill assets: `skills/imweb/`
- Plugin marketplace: `.agents/plugins/marketplace.json`
- Plugin manifest: `.codex-plugin/plugin.json`
- After installation, verify plugin/skill loading in a new Codex process rather than an already-running session

## Start Path

1. Run `codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main` or `./install/install-plugins.sh --tool codex`.
2. Install `imweb-ai-toolkit` from the Codex App or Codex CLI Plugins UI.
3. Start a new Codex process and verify that the plugin or skill is visible.
4. Begin with the `imweb-ai-toolkit:imweb` skill when you need a deterministic smoke entry, or use a natural-language imweb request such as `Use imweb tool to investigate suspicious recent orders.`

For local skill discovery only, use `./install/bootstrap-imweb.sh --tool codex --scope user` or `./install/install-skills.sh --tool codex --scope user`.
If you only need the standard Agent Skills fallback, use `npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex`.

## Related Docs

- Root start point: [../README.md](../README.md)
- Install/update contract: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- Support interpretation: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- Public skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)
- Codex marketplace: [../.agents/plugins/marketplace.json](../.agents/plugins/marketplace.json)

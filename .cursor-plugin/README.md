# Cursor Plugin Surface

The Cursor surface keeps `plugin.json` and `marketplace.json` beside the public `imweb` skill docs and root `.mcp.json` so users can inspect the manual connection points. This repo does not yet provide a Cursor-specific automatic installer, so the metadata documents the public entrypoint and manual MCP setup contract.

## Connection Order

1. Install or update the `imweb` CLI first.
2. Read `skills/imweb/` and `docs/skill-installation-and-usage.md` for the relevant execution guidance.
3. In the workspace, use `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, and `.mcp.json` as the manual connection references.

## When To Use This

- You want to quickly inspect the top-level plugin entrypoint from a Cursor workspace.
- You want the current public docs and MCP connection contract before doing any manual setup.

## Notes

- This repo does not bundle a standalone MCP server.
- Cursor is currently documented through manual setup metadata.
- The user must verify the final Cursor workspace connection in their own environment.
- See [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md) for support scope and manual setup differences.

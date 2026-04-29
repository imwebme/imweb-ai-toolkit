---
name: imweb
description: Start imweb CLI command discovery and safe execution guidance.
argument-hint: "[task]"
---

Use the imweb AI toolkit for the user's request:

`$ARGUMENTS`

Start from the bundled imweb skill instructions when they are available:

- `skills/imweb/SKILL.md`
- `skills/imweb/docs/capability-registry.md`
- `skills/imweb/docs/execution-contract.md`
- `skills/imweb/docs/commands.md`

Default flow:

1. Inspect current context with `imweb --output json config context`.
2. Inspect supported commands with `imweb --output json config command-capabilities`.
3. Route the task to the smallest supported domain and command path.
4. For any write-like operation, first gather current state with a read command, then use `--dry-run`.
5. Use `--yes` only after the target, input JSON, and change intent are explicit.

If the `imweb` CLI is missing, install or update it using the public installer documented in `docs/ai-agent-installation.md`.

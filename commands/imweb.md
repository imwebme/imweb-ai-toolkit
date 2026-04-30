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

1. Use bundled MCP tools first when available: `imweb_cli_check`, `imweb_auth_status`, `imweb_auth_login`, `imweb_context`, `imweb_command_capabilities`, and domain tools such as `imweb_order_list`.
2. If auth is missing or expired, call `imweb_auth_status` or `imweb_auth_doctor`, then use `imweb_auth_login` to open the browser login flow. Tell the user to finish the browser login; after the tool returns, re-check context and continue the original task.
3. Inspect current context with `imweb_context` or `imweb --output json config context`.
4. Inspect supported commands with `imweb_command_capabilities` or `imweb --output json config command-capabilities`.
5. Route the task to the smallest supported domain and command path.
6. For any write-like operation, first gather current state with a read command, then use `--dry-run`.
7. Use `--yes` only after the target, input JSON, and change intent are explicit.

If the host `imweb` CLI is missing, install or update it with `imweb_cli_install` when available, or use the public installer documented in `docs/ai-agent-installation.md`.

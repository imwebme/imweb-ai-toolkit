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

1. Use bundled MCP tools first when available: `imweb_cli_check`, `imweb_auth_status`, `imweb_auth_login`, `imweb_context`, `imweb_command_capabilities`, and domain tools such as `imweb_order_list`, `imweb_order_get`, `imweb_product_list`, `imweb_product_get`, and `imweb_member_list`.
2. Treat the user as non-technical. Explain only the next visible action they need to take, such as allowing a tool prompt or finishing browser login.
3. If Claude Desktop asks to allow an imweb MCP tool, tell the user to click `Allow for this task` / `이 작업에 허용`. Do not send the user to Terminal or computer-use for normal auth.
4. If auth is missing or expired, call `imweb_auth_status` or `imweb_auth_doctor`, then use `imweb_auth_login` to open the browser login flow. Tell the user to finish the browser login; after the tool returns, re-check context and continue the original task.
5. Inspect current context with `imweb_context` or `imweb --output json config context`.
6. Inspect supported commands with `imweb_command_capabilities` or `imweb --output json config command-capabilities`.
7. Route the task to the smallest supported domain and command path.
8. For any write-like operation, first gather current state with a read command, then use `--dry-run`.
9. Use `--yes` only after the target, input JSON, and change intent are explicit.

If the host `imweb` CLI is missing, install or update it with `imweb_cli_install` when available. If this is a sandbox or VM without MCP tools, use `npx -y github:imwebme/imweb-ai-toolkit --tool cli`, then run the auth/context checks. Do not ask a non-technical user to choose a package manager.

If the user asks for analytics that the CLI does not expose, such as visitor-ranked products, say that the current CLI does not provide visitor/traffic ranking. Then continue with the closest supported read-only check, such as product list, product detail, site info, reviews, or recent orders.

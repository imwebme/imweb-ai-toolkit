---
name: imweb
description: Start imweb CLI command discovery and safe execution guidance. Match aliases like 아임웹도구, 아임웹 도구, 아임웹툴, imweb tool, imweb tools, and imweb toolkit.
argument-hint: "[task]"
---

Use imweb tools for the user's request:

`$ARGUMENTS`

Treat short natural-language names such as `아임웹도구`, `아임웹 도구`, `아임웹툴`, `imweb tool`, `imweb tools`, and `imweb toolkit` as the same imweb entrypoint.

Start from the bundled imweb skill instructions when they are available:

- `skills/imweb/SKILL.md`
- `skills/imweb/docs/capability-registry.md`
- `skills/imweb/docs/execution-contract.md`
- `skills/imweb/docs/commands.md`

Default flow:

1. Use bundled MCP tools first when available: `imweb_cli_check`, `imweb_auth_status`, `imweb_auth_login`, `imweb_context`, `imweb_command_capabilities`, and domain tools such as `imweb_order_list`, `imweb_order_get`, `imweb_product_list`, `imweb_product_get`, and `imweb_member_list`.
2. If the MCP tools are present but the host `imweb` CLI is missing, call `imweb_cli_install` yourself. The user should only approve the visible tool/install prompt.
3. If this is Claude Desktop Cowork and the MCP tools are not present, do not ask the user to choose a setup path and do not install a VM-only CLI first. Shell/Bash tools are not imweb MCP tools. Run `npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork`, verify `imweb-ai-toolkit.plugin` and `imweb.skill`, and present both installable artifacts so the Cowork host can enable the imweb plugin surface and local MCP bridge. The user only clicks the install/accept card buttons.
4. Only in a non-Cowork sandbox or generic shell without MCP tools, check `command -v imweb` and install the CLI with `npx -y github:imwebme/imweb-ai-toolkit --tool cli` when missing.
5. Treat the user as non-technical. Explain only the next visible action they need to take, such as allowing a tool prompt, accepting an install card, or finishing browser login.
6. If Claude Desktop asks to allow an imweb MCP tool, tell the user to click `Allow for this task`. Do not send the user to Terminal or computer-use for normal auth.
7. If auth is missing or expired, call `imweb_auth_status` or `imweb_auth_doctor`, then use `imweb_auth_login` to open the browser login flow. Tell the user to finish the browser login; after the tool returns, re-check context and continue the original task.
8. Inspect current context with `imweb_context` or `imweb --output json config context`.
9. Inspect supported commands with `imweb_command_capabilities` or `imweb --output json config command-capabilities`.
10. Route the task to the smallest supported domain and command path.
11. For any write-like operation, first gather current state with a read command, then use `--dry-run`.
12. Use `--yes` only after the target, input JSON, and change intent are explicit.

If the request is simply `/imweb` with no task, perform the same setup checks first. End with a short invitation such as "Tell me the imweb task you want, such as checking orders or reviewing products"; do not end with a menu of setup choices. If Claude Desktop Cowork rejects slash-form text before the task starts, retry with a natural-language request such as "Use imweb tool to investigate suspicious recent orders."

If the user asks for analytics that the CLI does not expose, such as visitor-ranked products, say that the current CLI does not provide visitor/traffic ranking. Then continue with the closest supported read-only check, such as product list, product detail, site info, reviews, or recent orders.

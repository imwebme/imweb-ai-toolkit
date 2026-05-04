# Ask Claude To Install For Cowork

Use this when the user wants Claude Cowork to set up imweb instead of doing the install manually.

Copy this request inside a Claude Cowork task. Keep it as one message.

```text
Install imweb AI toolkit:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
Present imweb-ai-toolkit.plugin and imweb.skill so I can save them.
```

After the cards are installed, use a normal business request. Examples:

```text
최근 주문중 이상 거래 조사해줘. imweb AI Toolkit을 사용해줘.
```

```text
방문자 많은 상품 top 5 가져와서 상세페이지 점검해줘. imweb AI Toolkit으로 가능한 범위까지 확인해줘.
```

Users may also call the toolkit with shorter names:

```text
아임웹툴로 최근 주문중 이상 거래 조사해줘.
```

```text
imweb tool로 방문자 많은 상품 top 5 가져와서 가능한 범위까지 점검해줘.
```

Treat `아임웹도구`, `아임웹 도구`, `아임웹툴`, `imweb tool`, `imweb tools`, and `imweb toolkit` as aliases for the same imweb entrypoint.

The second request intentionally checks graceful limitation handling. If visitor-ranked product analytics are not available through the CLI, Claude should say so plainly and continue with supported product/site/review/order checks instead of inventing traffic data.

Current Claude Desktop Cowork builds may reject slash-form text such as `/imweb` before a task starts, even when the imweb skill is enabled. That is not a user setup mistake. Use the natural-language request above unless the Cowork slash picker explicitly exposes the imweb command.

Use the longer request below when you need Claude to explicitly report every verification step.

```text
Set up the imweb AI toolkit for this Cowork task from https://github.com/imwebme/imweb-ai-toolkit.

Use only terminal and file operations inside this task. Do not use computer-use. Do not open Customize, Settings, Skills, Plugins, or any Claude Desktop UI.

Run:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork

Then verify the generated artifacts:
1. imweb-ai-toolkit.plugin must contain .claude-plugin/plugin.json, .mcp.json, bin/imweb-mcp.mjs, commands/imweb.md, and skills/imweb/SKILL.md.
2. skills/imweb/SKILL.md must declare name: imweb.
3. imweb.skill should also exist as an installable Skill package and must contain imweb/SKILL.md.

Present imweb-ai-toolkit.plugin and imweb.skill as installable artifacts for this task. If this Cowork runtime provides a task-local install or file-presentation API, use it so the host can show the plugin and skill cards. If the host asks for confirmation, report that the user should click the install/accept buttons on the presented cards. Do not route the user through a manual builder or settings flow.
```

Expected result:

- `imweb-ai-toolkit.plugin` is created and verified as an installable Cowork plugin.
- `imweb.skill` is created and verified as a Claude Skill package named `imweb`.
- Claude does not use computer-use or UI automation.
- Claude presents the `.plugin` and `.skill` artifacts so the Cowork host can install and enable them.
- After the presented cards are accepted, start with a natural-language imweb request such as `최근 주문중 이상 거래 조사해줘. imweb AI Toolkit을 사용해줘.`
- The plugin includes the `/imweb` slash command for hosts that route plugin slash commands, plus a local `imweb-cli` MCP bridge for hosts that expose plugin MCP tools. If the Cowork start box rejects slash-form text, retry with natural language and do not ask the user to use Terminal.
- If Claude Desktop asks for permission to use an imweb tool, click `Allow for this task` / `이 작업에 허용`.
- If the host CLI is missing or outdated, Claude should let the MCP bridge run its official CLI install/update path, then continue the original imweb request.
- If the host CLI is not logged in, Claude should use the plugin's auth MCP tools to start the browser login flow. The user only needs to finish login in the browser; Claude should then re-check auth and continue the original imweb request.
- If the task runtime has no host MCP bridge and no way to present/install the plugin package, Claude may install the CLI inside that sandbox only for sandbox-local validation. For real user data, Claude should say that the host imweb plugin tools are not connected yet and present the package artifacts or route the user to Claude Desktop chat MCPB.

Important limitation:

- A Cowork task can create and verify the plugin and skill packages itself.
- If the task reports a read-only skills mount such as `/mnt/.claude/skills/`, treat that as the expected stop condition for a no-UI install request.
- If the runtime cannot install the presented artifacts during the current session, the imweb skill entrypoint and MCP tools will not appear until the generated plugin and skill are installed by the Cowork host or workspace admin.
- Claude Code plugin install and local `~/.claude/skills` discovery are separate from Claude Desktop Cowork.

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
/imweb 최근 주문중 이상 거래 조사
```

```text
/imweb 방문자 많은 상품 top 5 가져와서 상세페이지 점검
```

The second request intentionally checks graceful limitation handling. If visitor-ranked product analytics are not available through the CLI, Claude should say so plainly and continue with supported product/site/review/order checks instead of inventing traffic data.

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
- After the presented cards are accepted, start with `/imweb 최근 주문중 이상 거래 조사`, `/imweb 방문자 많은 상품 top 5 가져와서 상세페이지 점검`, or another natural-language imweb request.
- The plugin exposes the `/imweb` slash command and a local `imweb-cli` MCP bridge so Cowork can reuse the host CLI and auth state instead of installing the CLI inside the task VM when the bridge is available.
- If Claude Desktop asks for permission to use an imweb tool, click `Allow for this task` / `이 작업에 허용`.
- If the host CLI is not logged in, Claude should use the plugin's auth MCP tools to start the browser login flow. The user only needs to finish login in the browser; Claude should then re-check auth and continue the original imweb request.
- If the task runtime has no host MCP bridge and no `imweb` CLI, Claude may install the CLI inside the sandbox using `npx -y github:imwebme/imweb-ai-toolkit --tool cli`, then run the same auth/context checks. The user should only need to approve visible prompts and complete browser login.

Important limitation:

- A Cowork task can create and verify the plugin and skill packages itself.
- If the task reports a read-only skills mount such as `/mnt/.claude/skills/`, treat that as the expected stop condition for a no-UI install request.
- If the runtime cannot install the presented artifacts during the current session, the `/imweb` skill entrypoint and MCP tools will not appear until the generated plugin and skill are installed by the Cowork host or workspace admin.
- Claude Code plugin install and local `~/.claude/skills` discovery are separate from Claude Desktop Cowork.

# Ask Claude To Install For Cowork

Use this when the user wants Claude Cowork to set up imweb instead of doing the install manually.

Copy this request inside a Claude Cowork task. Keep it as one message.

```text
Set up the imweb AI toolkit for this Cowork task from https://github.com/imwebme/imweb-ai-toolkit.

Use only terminal and file operations inside this task. Do not use computer-use. Do not open Customize, Settings, Skills, Plugins, or any Claude Desktop UI.

Run:
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork

Then verify the generated artifacts:
1. imweb-ai-toolkit.plugin must contain .claude-plugin/plugin.json and skills/imweb/SKILL.md.
2. skills/imweb/SKILL.md must declare name: imweb.
3. imweb-skill.zip should also exist as a fallback package and must contain imweb/SKILL.md.

Present imweb-ai-toolkit.plugin as the installable Cowork plugin artifact for this task. If this Cowork runtime provides a task-local plugin install or file-presentation API, use it so the host can show the plugin install card. If the host asks for confirmation, report that the user should click the install/accept button on the presented plugin card. Do not route the user through a manual builder or settings flow.
```

Expected result:

- `imweb-ai-toolkit.plugin` is created and verified as an installable Cowork plugin.
- `imweb-skill.zip` is created and verified as a fallback Claude Skill package named `imweb`.
- Claude does not use computer-use or UI automation.
- Claude presents the `.plugin` artifact so the Cowork host can install and enable it.

Important limitation:

- A Cowork task can create and verify the plugin package itself.
- If the task reports a read-only skills mount such as `/mnt/.claude/skills/`, treat that as the expected stop condition for a no-UI install request.
- If the runtime cannot install the presented `.plugin` artifact during the current session, bare `/imweb` will not appear until the generated plugin is installed by the Cowork host or workspace admin.
- Claude Code plugin install and local `~/.claude/skills` discovery are separate from Claude Desktop Cowork.

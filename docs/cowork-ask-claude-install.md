# Ask Claude To Install For Cowork

Use this when the user wants Claude Cowork to set up imweb instead of doing the install manually.

Copy this request inside a Claude Cowork task. Keep it as one message.

```text
Set up the imweb AI toolkit for this Cowork task from https://github.com/imwebme/imweb-ai-toolkit.

Use only terminal and file operations inside this task. Do not use computer-use. Do not open Customize, Settings, Skills, Plugins, or any Claude Desktop UI.

Run:
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork

Then verify the generated artifacts:
1. imweb-skill.zip must contain imweb/SKILL.md.
2. imweb/SKILL.md must declare name: imweb.
3. imweb-ai-toolkit-plugin.zip should also exist for plugin or organization provisioning.

If this Cowork runtime supports project-local skills or commands without UI upload, install the generated imweb skill into that supported project-local location and verify by reading the installed SKILL.md. If it does not, do not try to operate the Claude app. Leave the zip files in the task folder and report that current-session bare /imweb requires user/admin Skill provisioning outside this task.
```

Expected result:

- `imweb-skill.zip` is created and verified as a Claude Skill named `imweb`.
- `imweb-ai-toolkit-plugin.zip` is created for plugin or organization marketplace workflows.
- Claude does not use computer-use or UI automation.

Important limitation:

- A Cowork task can create and verify the packages itself.
- If the runtime cannot load new Skills from the task filesystem during the current session, bare `/imweb` will not appear until the generated Skill package is provisioned by the user, workspace admin, or a supported Cowork Skill installation flow.
- Claude Code plugin install and local `~/.claude/skills` discovery are separate from Claude Desktop Cowork.

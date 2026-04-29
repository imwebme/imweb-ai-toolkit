# Ask Claude To Install For Cowork

Use this when the user wants Claude Cowork to set up imweb instead of doing the install manually.

Copy or adapt this request inside a Claude Cowork task:

```text
Install the imweb AI toolkit for this Claude Cowork environment.

Source: https://github.com/imwebme/imweb-ai-toolkit

Please do the setup yourself:
1. Create the direct Cowork skill package for the /imweb shortcut:
   npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
2. Review the generated imweb-skill.zip contents before enabling it. It must contain imweb/SKILL.md, and the SKILL.md name must be imweb.
3. Install or upload imweb-skill.zip through Customize > Skills so the imweb skill is enabled.
4. If plugin installation is also available in this workspace, install or upload imweb-ai-toolkit-plugin.zip through Customize > Plugins.
5. Verify that /imweb appears in the slash menu. If the slash menu does not expose it, verify by asking: "Use the imweb skill to explain what config command-capabilities checks."

Do not ask me to do the file creation or upload steps unless your current environment cannot control Claude Desktop settings. If a confirmation prompt appears for installing a local skill or plugin, explain the source and ask me to approve that prompt.
```

Expected result:

- `imweb-skill.zip` is installed as a Claude Skill named `imweb`.
- `/imweb` appears in Cowork when Skills are enabled.
- `imweb-ai-toolkit-plugin.zip` is optional for plugin/marketplace workflows; the direct `/imweb` shortcut is provided by the skill package.

If Claude cannot access the Skills upload UI, it should report that limitation and leave the generated `imweb-skill.zip` ready for organization provisioning or later upload.

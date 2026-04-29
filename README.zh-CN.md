# imweb-ai-toolkit

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

`imweb-ai-toolkit` 会安装 `imweb` CLI，并将其连接到受支持的 AI coding tool。此仓库提供 skill asset、surface metadata、示例和 bootstrap script，让用户无需了解 CLI 背后的分发结构即可开始使用。

```mermaid
flowchart LR
  Toolkit["imweb-ai-toolkit"] --> CLI["imweb-cli"]
  Toolkit --> Codex["Codex"]
  Toolkit --> Claude["Claude"]
  Toolkit --> Cursor["Cursor"]
  Codex --> CLI
  Claude --> CLI
  Cursor --> CLI
```

## 包含内容

- 用于 Codex、Claude、Cursor 和 MCP reference wiring 的 `plugin.json`、marketplace metadata 与 surface metadata
- `skills/imweb/`: `imweb` skill bundle 及其 bundle-local docs
- `commands/imweb.md`: 用于 imweb workflow 的 Claude plugin command entrypoint
- `install/`: 用于 CLI、skill 和 plugin setup 的 bootstrap/installer script
- `docs/`: 公开使用、集成和 support matrix 文档
- `examples/`: sample workflow 和 fixture

## 安装

Claude Code plugin setup：

```bash
claude plugin marketplace add imwebme/imweb-ai-toolkit --scope user
claude plugin install imweb-ai-toolkit@imweb-ai-toolkit --scope user
```

Claude Code chat form：

```text
/plugin marketplace add imwebme/imweb-ai-toolkit
/plugin install imweb-ai-toolkit@imweb-ai-toolkit
```

Codex marketplace setup：

```bash
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

Codex 在注册 marketplace 后通过 Plugins UI 安装。如果需要立即验证 Codex skill discovery，或由 AI coding agent 执行安装，请使用 public `npx` installer。

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

标准 Agent Skills fallback：

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

在 Claude Cowork 中，请让 Claude 运行 installer 并展示生成的 plugin 文件。

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

此命令会生成 `imweb-ai-toolkit.plugin` 和 fallback 用的 `imweb-skill.zip`。Claude 应验证 package 内容，并把 `imweb-ai-toolkit.plugin` 作为可安装的 Cowork plugin artifact 展示出来。不要让 Claude 打开 Claude Desktop settings 或用 computer-use 操作桌面。给 Claude 的请求文本见 [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)，完整 checklist 见 [docs/ai-agent-installation.md](docs/ai-agent-installation.md)。

对受支持的 surface 使用 bootstrap script。

```bash
./install/bootstrap-imweb.sh --tool codex --scope user
./install/bootstrap-imweb.sh --tool claude --scope user
```

PowerShell:

```powershell
./install/bootstrap-imweb.ps1 -Tool codex -Scope user
./install/bootstrap-imweb.ps1 -Tool claude -Scope user
```

Bootstrap script 会按需安装或更新 `imweb` CLI，然后为所选 tool 安装 `imweb` skill。高级本地设置或固定版本测试请参见 [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)。

Plugin-first setup 会注册或安装 toolkit plugin。

```bash
./install/install-plugins.sh --tool codex
./install/install-plugins.sh --tool claude --scope user
./install/install-plugins.sh --package imweb-ai-toolkit.plugin
```

PowerShell:

```powershell
./install/install-plugins.ps1 -Tool codex
./install/install-plugins.ps1 -Tool claude -Scope user
./install/install-plugins.ps1 -Package imweb-ai-toolkit.plugin
```

Codex 在注册 marketplace 后通过 Plugins UI 安装。Claude Code 可以从已注册的 marketplace 直接安装，并用 `/imweb-ai-toolkit:imweb` 验证 plugin skill。Claude Cowork 使用生成的 `.plugin` artifact 安装 plugin，让 Cowork slash menu 显示 `imweb` Skill；`imweb-skill.zip` 仅作为 fallback package 保留。

## 从这里开始

1. [docs/ai-agent-installation.md](docs/ai-agent-installation.md)
2. [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)
3. [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)
4. [docs/cli-toolkit-integration.md](docs/cli-toolkit-integration.md)
5. [docs/surface-support-matrix.md](docs/surface-support-matrix.md)
6. [skills/imweb/SKILL.md](skills/imweb/SKILL.md)

## 支持范围

Codex App/CLI、Claude Code 和 Claude Desktop Cowork 是主要支持的 plugin surface。Cursor 被记录为有限/手动连接 surface。权威 support detail 请参见 [docs/surface-support-matrix.md](docs/surface-support-matrix.md)。

## 许可证

此仓库中的 toolkit asset 根据 [Apache-2.0](LICENSE) 授权。
Imweb 商标和 brand asset 不包含在 Apache-2.0 授权中；请参见 [TRADEMARKS.md](TRADEMARKS.md)。

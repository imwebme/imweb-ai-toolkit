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

- 在 Claude Code 中，在 Claude Code 聊天里运行这两行：

```text
/plugin marketplace add imwebme/imweb-ai-toolkit
/plugin install imweb-ai-toolkit@imweb-ai-toolkit
```

- 在 Codex 中，先注册 marketplace，然后从 Plugins UI 添加 `imweb-ai-toolkit`：

```bash
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

- 在 Claude Desktop Cowork 中，在 Cowork task 里让 Claude 执行：

```text
Set up imweb AI toolkit for this Cowork task:
npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork
Present imweb-ai-toolkit.plugin so I can save it.
```

- 让 AI coding agent 为 Codex 和 Claude Code 执行本地安装时，使用这一行：

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool both
```

Cowork 命令会生成 `imweb-ai-toolkit.plugin` 和 fallback `imweb-skill.zip`。保存展示出的 plugin card 后，从 `/imweb` 开始；zip 只作为 fallback package 使用。

## 其他安装方式

如果目标工具不支持 plugin，请直接安装标准 Agent Skill：

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

完整 installer flag、验证步骤和 manual clone fallback 见 [docs/ai-agent-installation.md](docs/ai-agent-installation.md)。高级本地设置或固定版本测试请参见 [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)。

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

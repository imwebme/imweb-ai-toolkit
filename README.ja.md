# imweb-ai-toolkit

[English](README.md) | [한국어](README.ko.md) | [中文](README.zh-CN.md)

`imweb-ai-toolkit` は `imweb` CLI をインストールし、対応する AI coding tool に接続します。このリポジトリは、ユーザーが CLI の配布構造を意識せずに始められるように、skill asset、surface metadata、サンプル、bootstrap script を提供します。

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

## 含まれるもの

- Codex、Claude、Cursor、MCP reference wiring のための `plugin.json`、marketplace metadata、surface metadata
- `skills/imweb/`: `imweb` skill bundle と bundle-local docs
- `commands/imweb.md`: imweb workflow 用 Claude plugin command entrypoint
- `install/`: CLI、skill、plugin setup のための bootstrap/installer script
- `docs/`: 公開利用、統合、support matrix のドキュメント
- `examples/`: sample workflow と fixture

## インストール

Claude Code plugin setup:

```bash
claude plugin marketplace add imwebme/imweb-ai-toolkit --scope user
claude plugin install imweb-ai-toolkit@imweb-ai-toolkit --scope user
```

Claude Code chat form:

```text
/plugin marketplace add imwebme/imweb-ai-toolkit
/plugin install imweb-ai-toolkit@imweb-ai-toolkit
```

Codex marketplace setup:

```bash
codex plugin marketplace add imwebme/imweb-ai-toolkit --ref main
```

Codex は marketplace 登録後に Plugins UI でインストールします。Codex skill discovery をすぐに確認したい場合、または AI coding agent にセットアップを任せる場合は、public `npx` installer を使用します。

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

標準 Agent Skills fallback:

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

Claude Cowork では、Claude に installer を実行させ、生成された plugin ファイルを提示させます。

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

このコマンドは `imweb-ai-toolkit.plugin` と fallback 用の `imweb-skill.zip` を作成します。Claude は package の内容を検証し、`imweb-ai-toolkit.plugin` をインストール可能な Cowork plugin artifact として提示します。Claude Desktop settings を開いたり computer-use で操作したりしません。Claude に渡す依頼文は [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)、全体 checklist は [docs/ai-agent-installation.md](docs/ai-agent-installation.md) を参照してください。

対応 surface には bootstrap script を使用します。

```bash
./install/bootstrap-imweb.sh --tool codex --scope user
./install/bootstrap-imweb.sh --tool claude --scope user
```

PowerShell:

```powershell
./install/bootstrap-imweb.ps1 -Tool codex -Scope user
./install/bootstrap-imweb.ps1 -Tool claude -Scope user
```

Bootstrap script は必要に応じて `imweb` CLI をインストールまたは更新し、選択した tool に `imweb` skill をインストールします。高度なローカル設定や固定バージョンのテストは [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md) を参照してください。

Plugin-first setup では toolkit plugin を登録またはインストールします。

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

Codex は marketplace 登録後に Plugins UI でインストールします。Claude Code は登録済み marketplace から直接インストールし、`/imweb-ai-toolkit:imweb` で plugin skill を検証できます。Claude Cowork は生成された `.plugin` artifact をインストールして Cowork slash menu に `imweb` Skill を表示する経路を使い、`imweb-skill.zip` は fallback package としてのみ残します。

## 最初に読むもの

1. [docs/ai-agent-installation.md](docs/ai-agent-installation.md)
2. [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)
3. [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)
4. [docs/cli-toolkit-integration.md](docs/cli-toolkit-integration.md)
5. [docs/surface-support-matrix.md](docs/surface-support-matrix.md)
6. [skills/imweb/SKILL.md](skills/imweb/SKILL.md)

## サポート範囲

Codex App/CLI、Claude Code、Claude Desktop Cowork は主要な plugin 対応 surface です。Cursor は限定的/手動接続 surface として文書化されています。正式な support detail は [docs/surface-support-matrix.md](docs/surface-support-matrix.md) を参照してください。

## ライセンス

このリポジトリの toolkit asset は [Apache-2.0](LICENSE) でライセンスされています。
Imweb の商標と brand asset は Apache-2.0 ではライセンスされません。詳細は [TRADEMARKS.md](TRADEMARKS.md) を参照してください。

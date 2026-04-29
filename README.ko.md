# imweb-ai-toolkit

[English](README.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

`imweb-ai-toolkit`은 `imweb` CLI를 설치하고 지원되는 AI coding tool에 연결합니다. 이 저장소는 사용자가 CLI 배포 구조를 알 필요 없이 시작할 수 있도록 skill asset, surface metadata, 예시, bootstrap script를 제공합니다.

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

## 포함 내용

- Codex, Claude, Cursor, MCP reference wiring을 위한 `plugin.json`, marketplace metadata, surface metadata
- `skills/imweb/`: `imweb` skill bundle과 bundle-local docs
- `commands/imweb.md`: imweb workflow용 Claude plugin command entrypoint
- `install/`: CLI, skill, plugin setup용 bootstrap/installer script
- `docs/`: 공개 사용법, 통합, support matrix 문서
- `examples/`: sample workflow와 fixture

## 설치

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

Codex는 marketplace 등록 후 Plugins UI에서 설치합니다. Codex skill discovery를 바로 확인해야 하거나 AI coding agent에게 설치를 맡기는 경우 public `npx` installer를 사용합니다.

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

표준 Agent Skills fallback:

```bash
npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex
```

Claude Cowork에서는 Claude에게 installer를 실행하고 생성된 plugin 파일을 제시하게 합니다.

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool claude-cowork
```

이 명령은 `imweb-ai-toolkit.plugin`과 fallback용 `imweb-skill.zip`을 만듭니다. Claude는 package 내용을 검증하고 `imweb-ai-toolkit.plugin`을 설치 가능한 Cowork plugin artifact로 제시해야 합니다. Claude Desktop 설정을 열거나 computer-use로 조작하게 하지 않습니다. Claude에게 줄 요청문은 [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md), 전체 checklist는 [docs/ai-agent-installation.md](docs/ai-agent-installation.md)를 봅니다.

지원 surface에는 bootstrap script를 사용합니다.

```bash
./install/bootstrap-imweb.sh --tool codex --scope user
./install/bootstrap-imweb.sh --tool claude --scope user
```

PowerShell:

```powershell
./install/bootstrap-imweb.ps1 -Tool codex -Scope user
./install/bootstrap-imweb.ps1 -Tool claude -Scope user
```

Bootstrap script는 필요하면 `imweb` CLI를 설치하거나 업데이트한 뒤, 선택한 tool에 `imweb` skill을 설치합니다. 고급 로컬 설치나 고정 버전 테스트는 [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)를 봅니다.

Plugin-first setup은 toolkit plugin을 등록하거나 설치합니다.

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

Codex는 marketplace 등록 후 Plugins UI에서 설치합니다. Claude Code는 등록된 marketplace에서 바로 설치하고 `/imweb-ai-toolkit:imweb`로 plugin skill을 검증할 수 있습니다. Claude Cowork는 생성된 `.plugin` artifact를 설치해 Cowork slash 메뉴에 `imweb` Skill을 노출하는 경로를 사용하고, `imweb-skill.zip`은 fallback package로만 유지합니다.

## 먼저 볼 문서

1. [docs/ai-agent-installation.md](docs/ai-agent-installation.md)
2. [docs/cowork-ask-claude-install.md](docs/cowork-ask-claude-install.md)
3. [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)
4. [docs/cli-toolkit-integration.md](docs/cli-toolkit-integration.md)
5. [docs/surface-support-matrix.md](docs/surface-support-matrix.md)
6. [skills/imweb/SKILL.md](skills/imweb/SKILL.md)

## 지원 범위

Codex App/CLI, Claude Code, Claude Desktop Cowork는 기본 plugin 지원 surface입니다. Cursor는 제한적/수동 연결 surface로 문서화합니다. authoritative support detail은 [docs/surface-support-matrix.md](docs/surface-support-matrix.md)를 봅니다.

## 라이선스

이 저장소의 toolkit asset은 [Apache-2.0](LICENSE)으로 배포됩니다.
Imweb 상표와 brand asset은 Apache-2.0으로 라이선스되지 않습니다. 자세한 내용은 [TRADEMARKS.md](TRADEMARKS.md)를 봅니다.

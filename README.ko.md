# imweb-ai-toolkit

[English](README.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

`imweb-ai-toolkit`은 `imweb` CLI를 지원되는 AI coding surface에 연결합니다. 이 저장소는 skill asset, surface metadata, 예시, install/bootstrap script를 제공합니다. CLI 바이너리와 release payload는 공개 `imweb-cli-release` 배포 평면에서 가져옵니다.

```mermaid
flowchart LR
  CLI["imweb-cli"] --> Release["imweb-cli-release"]
  Release --> Toolkit["imweb-ai-toolkit"]
  Toolkit --> Codex["Codex"]
  Toolkit --> Claude["Claude"]
  Toolkit --> Cursor["Cursor"]
```

## 포함 내용

- Codex, Claude, Cursor, MCP reference wiring을 위한 `plugin.json`과 surface metadata
- `skills/imweb/`: `imweb` skill bundle과 bundle-local docs
- `install/`: CLI 및 skill setup용 bootstrap/installer script
- `docs/`: 공개 사용법, 통합, support matrix 문서
- `examples/`: sample workflow와 fixture

## 설치

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

Installer 기본값은 공개 `imweb-cli-release` stable channel입니다. 로컬 또는 고정 버전 테스트가 필요하면 [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)에 설명된 release manifest file을 전달합니다.

## 먼저 볼 문서

1. [docs/skill-installation-and-usage.md](docs/skill-installation-and-usage.md)
2. [docs/cli-toolkit-integration.md](docs/cli-toolkit-integration.md)
3. [docs/surface-support-matrix.md](docs/surface-support-matrix.md)
4. [skills/imweb/SKILL.md](skills/imweb/SKILL.md)

## 지원 범위

Codex와 Claude는 automated bootstrap의 기본 지원 surface입니다. Cursor와 Claude Cowork는 제한적/수동 연결 surface로 문서화합니다. authoritative support detail은 [docs/surface-support-matrix.md](docs/surface-support-matrix.md)를 봅니다.

## 라이선스

이 저장소의 toolkit asset은 [Apache-2.0](LICENSE)으로 배포됩니다.
Imweb 상표와 brand asset은 Apache-2.0으로 라이선스되지 않습니다. 자세한 내용은 [TRADEMARKS.md](TRADEMARKS.md)를 봅니다.

# CLI Toolkit Integration

이 문서는 `imweb-ai-toolkit` 자산이 `imweb-cli` 공개 배포 계약과 어디에서 만나고, 어떤 흐름으로 연결되는지 설명합니다. 핵심은 "실행은 CLI가 담당하고, 연결과 안내는 toolkit이 담당한다"입니다.

## 연결 모델

- CLI binary와 release payload의 source-of-truth는 외부 `imweb-cli`가 가집니다.
- 기본 distribution entrypoint는 public `imwebme/imweb-cli-release`의 stable pointer(`channels/stable.json`)가 제공합니다.
- 이 레포의 `install/` 스크립트는 그 release metadata를 소비해 CLI를 설치하거나 업데이트합니다.
- skill `imweb`는 설치 후 각 런타임 discovery 경로에 배치되거나 plugin bundle 안에서 로드됩니다.
- 표면별 `plugin.json`과 marketplace metadata는 어느 런타임이 어떤 자산을 읽어야 하는지 알려줍니다.

## 공개 연결 계약

public-safe snapshot은 아래 계약만 외부에 노출합니다.

- CLI 설치 기본값은 public stable release plane입니다.
- toolkit은 bootstrap, skill 설치, plugin 설치/패키징, surface metadata를 제공합니다.
- runtime별 제한이나 수동 연결 범위는 표면 metadata와 support matrix에서만 설명합니다.
- 운영용 검증 기록과 배포 준비 문서는 public snapshot 계약에 포함하지 않습니다.

## 실제 연결 지점

### 루트 entrypoint

- [../plugin.json](../plugin.json)
  - 표면별 entrypoint를 모으는 canonical root entrypoint입니다.

### 표면별 entrypoint

- Codex: [../.codex-plugin/plugin.json](../.codex-plugin/plugin.json)
- Claude: [../.claude-plugin/plugin.json](../.claude-plugin/plugin.json)
- Cursor: [../.cursor-plugin/plugin.json](../.cursor-plugin/plugin.json)
- MCP reference: [../.mcp.json](../.mcp.json)

### skill entrypoint

- [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

### 설치 entrypoint

- shell bootstrap: `./install/bootstrap-imweb.sh`
- PowerShell bootstrap: `./install/bootstrap-imweb.ps1`
- shell CLI installer: `./install/install-cli.sh`
- shell skill installer: `./install/install-skills.sh`
- shell plugin installer: `./install/install-plugins.sh`
- PowerShell plugin installer: `./install/install-plugins.ps1`

## 흐름별 설명

### 1. bootstrap 흐름

bootstrap은 가장 높은 수준의 통합 경로입니다.

1. 대상 표면을 고릅니다.
2. CLI 설치기 또는 업데이트 경로를 실행합니다.
3. 해당 표면의 discovery 규칙에 맞춰 `skills/imweb/`를 배치합니다.
4. 표면 README와 plugin metadata를 기준으로 사용을 시작합니다.

즉, bootstrap은 "CLI + skill 연결"을 한 번에 처리하는 진입점입니다.

### 2. CLI만 먼저 맞추는 흐름

CLI 바이너리만 별도로 맞출 수 있습니다.

- 도구: `install/install-cli.sh`, `install/install-cli.ps1`
- 입력: public stable channel pointer 또는 release manifest, 필요하면 local override manifest
- 목적: 실행기 버전을 먼저 맞춘 뒤, 나중에 skill을 배치하는 것
- local override manifest는 fixture/오프라인 검증용 우회 경로입니다.

### 3. skill만 배치하는 흐름

이미 CLI가 설치되어 있다면 skill만 설치할 수 있습니다.

- 도구: `install/install-skills.sh`, `install/install-skills.ps1`
- 입력: `--tool`, `--scope`, `--mode`
- 목적: Codex 또는 Claude discovery 경로에 `skills/imweb/`를 복사하거나 링크하는 것

### 4. plugin-first 설치 흐름

plugin marketplace를 지원하는 표면은 toolkit repo 자체를 installable plugin으로 노출합니다.

- Codex: `.agents/plugins/marketplace.json`를 등록한 뒤 Codex App 또는 CLI의 Plugins UI에서 설치합니다.
- Claude Code: `.claude-plugin/marketplace.json`를 등록하고 `imweb-ai-toolkit@imweb-ai-toolkit`을 설치한 뒤 `/imweb-ai-toolkit:imweb`로 plugin skill을 확인합니다.
- Claude Desktop Cowork: `install-plugins`가 만든 zip을 custom plugin file로 업로드하거나 조직 marketplace를 사용합니다. Claude Code CLI registry와 `~/.claude/skills`는 Desktop Cowork 설치를 대체하지 않습니다.

### 5. 수동 연결 흐름

Cursor는 현재 문서 기반 수동 연결이 기준입니다.

- Cursor는 `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, `.mcp.json`을 함께 확인합니다.

## 지원 범위 해석

- Codex CLI/App: 지원
- Claude Code: 지원
- Claude Desktop Cowork: 지원
- Cursor workspace: 제한적 지원

정식 기준은 [surface-support-matrix.md](./surface-support-matrix.md)를 따릅니다.

## toolkit이 CLI에 요구하는 최소 계약

toolkit은 아래 전제를 가지고 CLI를 소비합니다.

- `imweb --help`가 공개 command truth를 제공합니다.
- `imweb --output json`이 자동화 가능한 출력 truth를 제공합니다.
- `--dry-run`과 `--yes`의 의미는 CLI가 정의합니다.
- toolkit은 이 계약을 문서화하고 작업 절차에 반영하지만, 임의로 확장하지 않습니다.

세부 내용은 [../skills/imweb/docs/execution-contract.md](../skills/imweb/docs/execution-contract.md)와 [../skills/imweb/docs/capability-registry.md](../skills/imweb/docs/capability-registry.md)를 함께 봅니다.

## 개발자가 점검할 것

- 설치 문서의 경로와 실제 스크립트 경로가 일치하는지
- root `plugin.json`의 entrypoint가 실제 표면 파일을 가리키는지
- 표면 README가 현재 지원 수준과 일치하는지
- 제한적 지원 표면에 자동 설치처럼 오해될 표현이 없는지

## 관련 문서

- [../README.md](../README.md)
- [imweb-ai-toolkit.md](./imweb-ai-toolkit.md)
- [skill-installation-and-usage.md](./skill-installation-and-usage.md)
- [surface-support-matrix.md](./surface-support-matrix.md)
- [../skills/imweb/docs/execution-contract.md](../skills/imweb/docs/execution-contract.md)
- [../skills/imweb/docs/capability-registry.md](../skills/imweb/docs/capability-registry.md)

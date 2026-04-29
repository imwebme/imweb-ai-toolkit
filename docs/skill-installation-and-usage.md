# CLI와 Skill 설치

이 문서는 `imweb-ai-toolkit`에서 `imweb` CLI를 설치 또는 업데이트하고, skill `imweb`를 어떤 surface에서 어떤 방식으로 읽는지 정리합니다.

## 설치 흐름 요약

1. `imweb` CLI를 설치하거나 업데이트합니다.
2. 필요하면 skill `imweb`를 discovery 경로에 배치합니다.
3. 대상 surface가 plugin marketplace를 지원하면 plugin을 등록하거나 설치합니다.
4. 대상 surface의 plugin README와 metadata를 읽고 사용을 시작합니다.

AI coding agent에게 설치를 맡길 때는 public repo를 clone하기보다 `npx` installer를 우선 사용합니다.

```bash
npx --yes github:imwebme/imweb-ai-toolkit --tool both --scope user
```

이 installer는 `npx` 임시 package 경로를 marketplace source로 등록하지 않고, public Git repository를 durable source로 등록합니다. 자세한 agent용 checklist는 [ai-agent-installation.md](./ai-agent-installation.md)를 봅니다.

지원 surface에서 한 번에 처리하려면 bootstrap을 사용합니다.

```bash
./install/bootstrap-imweb.sh --tool codex --scope user
./install/bootstrap-imweb.sh --tool claude --scope user
```

PowerShell:

```powershell
./install/bootstrap-imweb.ps1 -Tool codex -Scope user
./install/bootstrap-imweb.ps1 -Tool claude -Scope user
```

## CLI 설치와 업데이트

CLI 설치기는 public `imweb-cli-release` stable pointer를 기본으로 읽고, 필요하면 release manifest override 또는 local manifest override도 받을 수 있습니다.

기본 CLI binary fetch는 public surface이므로 `gh auth`를 요구하지 않습니다. 명시적 override가 필요하면 아래 경로를 사용합니다.

- `install-cli.*`는 `--manifest-file` 또는 `-ManifestFile`, `bootstrap-imweb.*`는 `--cli-manifest-file` 또는 `-CliManifestFile`로 local `release-manifest.json`을 넘겨 CLI 설치/업데이트 경로를 고정
- 이미 설치된 `imweb` CLI를 그대로 두고 `install-skills.*`만 실행해 Codex/Claude discovery 연결만 검증

authenticated GitHub Release URL을 override로 직접 주는 경우에만 GitHub 계정, `gh auth login`, repo read 권한이 필요할 수 있습니다.

bootstrap shell:

```bash
./install/bootstrap-imweb.sh --tool codex --scope user --cli-manifest-file /path/to/release-manifest.json
```

bootstrap PowerShell:

```powershell
./install/bootstrap-imweb.ps1 -Tool codex -Scope user -CliManifestFile C:\path\to\release-manifest.json
```

shell:

```bash
./install/install-cli.sh
./install/install-cli.sh --manifest-file /path/to/release-manifest.json
```

PowerShell:

```powershell
./install/install-cli.ps1
./install/install-cli.ps1 -ManifestFile C:\path\to\release-manifest.json
```

정책은 아래와 같습니다.

- 현재 플랫폼에 맞는 archive만 설치
- 같은 버전이 이미 있으면 기본 동작은 skip
- `--force` 또는 `-Force`를 주면 재설치
- 설치 후 `imweb --version`으로 버전 확인 시도
- Windows에서는 출력의 `bin_dir` 값을 사용자 PATH에 추가해야 새 터미널에서 바로 `imweb`를 실행할 수 있음

## Skill 설치

skill 설치기는 `skills/imweb/`를 Codex 또는 Claude discovery 경로에 복사하거나 링크합니다. 이것은 로컬 authoring/discovery 경로입니다. Codex App, Claude Code, Claude Desktop Cowork처럼 plugin marketplace를 지원하는 표면에는 아래 "Plugin 설치" 흐름을 우선 사용합니다.

- Codex user scope 기본 경로: `$CODEX_HOME/skills`
- `CODEX_HOME`이 비어 있으면 Codex user scope 기본 경로: `~/.codex/skills`
- Codex project scope 기본 경로: `<repo>/.codex/skills`
- Codex는 새 프로세스에서 설치된 skill을 다시 스캔하므로, 설치 후에는 새 Codex 프로세스로 확인하는 편이 안전합니다.
- 재설치 계약은 shell/PowerShell 공통입니다. `copy`는 기존 skill 경로가 있으면 실패합니다.
- `symlink`는 같은 source를 가리키는 기존 symlink만 성공으로 건너뛰고 `skipped_existing`로 보고합니다. 다른 symlink, 일반 디렉터리, 파일이 있으면 충돌로 실패합니다.

Codex:

```bash
./install/install-skills.sh --tool codex --scope user --mode copy
./install/install-skills.sh --tool codex --scope project --mode symlink
```

Claude:

```bash
./install/install-skills.sh --tool claude --scope user --mode copy
./install/install-skills.sh --tool claude --scope project --mode symlink
```

PowerShell:

```powershell
./install/install-skills.ps1 -Tool codex -Scope user -Mode copy
./install/install-skills.ps1 -Tool claude -Scope project -Mode symlink
```

bootstrap도 같은 계약을 그대로 따릅니다. 따라서 `bootstrap-imweb.*`를 `-SkillMode symlink`로 다시 실행했을 때 대상에 같은 source를 가리키는 symlink가 이미 있으면 skill 단계는 성공적으로 건너뜁니다.

## Plugin 설치

plugin 설치기는 이 toolkit repo 자체를 installable plugin으로 노출합니다.

Codex:

```bash
./install/install-plugins.sh --tool codex
```

Codex CLI는 marketplace 등록 명령을 제공하지만 plugin 설치는 현재 Plugins UI에서 진행합니다. 위 명령 후 Codex App 또는 Codex CLI의 `/plugins` 화면에서 `imweb-ai-toolkit`을 설치합니다. repo 안에서 바로 테스트하는 경우 Codex는 `.agents/plugins/marketplace.json`도 marketplace 후보로 읽을 수 있습니다.

Claude Code:

```bash
./install/install-plugins.sh --tool claude --scope user
```

PowerShell:

```powershell
./install/install-plugins.ps1 -Tool codex
./install/install-plugins.ps1 -Tool claude -Scope user
```

Claude Code는 `user`, `project`, `local` scope를 지원합니다. 설치 후 기존 세션에서는 `/reload-plugins`를 실행하거나 새 세션을 시작합니다.
plugin skill 로드를 결정적으로 확인해야 하는 CLI smoke에서는 `/imweb-ai-toolkit:imweb`로 프롬프트를 시작합니다. 일반 목적 요청은 모델과 세션 상태에 따라 skill 선택이 늦어질 수 있습니다.

Claude Desktop Cowork:

```bash
./install/install-plugins.sh --package imweb-ai-toolkit-plugin.zip
```

PowerShell:

```powershell
./install/install-plugins.ps1 -Package imweb-ai-toolkit-plugin.zip
```

생성된 zip은 Claude Desktop의 Cowork > Customize > Browse plugins 흐름에서 custom plugin file로 업로드합니다. Desktop Cowork는 Claude Code CLI의 `~/.claude/plugins` registry나 `~/.claude/skills`를 직접 읽지 않으므로, local Desktop 검증은 이 zip upload 또는 조직 배포 경로를 기준으로 합니다. 설치/활성화 후에는 `/imweb-ai-toolkit:imweb`로 시작합니다. Desktop 앱/계정에서 personal custom upload가 보이지 않으면 Team/Enterprise manual marketplace upload를 사용합니다. GitHub synced Cowork organization marketplace는 private/internal GitHub repo만 허용하므로 public repo는 npx/package source로 사용하고, 조직 배포에는 private/internal mirror를 둡니다.

## 표면별 시작점

- Codex 표면 안내: [../.codex-plugin/README.md](../.codex-plugin/README.md)
- Codex marketplace 메타: [../.agents/plugins/marketplace.json](../.agents/plugins/marketplace.json)
- Claude 표면 안내: [../.claude-plugin/README.md](../.claude-plugin/README.md)
- Claude marketplace 메타: [../.claude-plugin/marketplace.json](../.claude-plugin/marketplace.json)
- Cursor 표면 안내: [../.cursor-plugin/README.md](../.cursor-plugin/README.md)
- Cursor marketplace 메타: [../.cursor-plugin/marketplace.json](../.cursor-plugin/marketplace.json)
- MCP 연결 기준: [../.mcp.json](../.mcp.json)
- 지원 매트릭스: [surface-support-matrix.md](./surface-support-matrix.md)

아래 문서는 시작점 안내용입니다. host 앱의 실제 로드 방식이나 UI 차이는 각 surface 버전에 따라 달라질 수 있습니다.

Cursor는 현재 수동 연결 기준만 제공합니다. 별도 설치 스크립트와 자동 연결 흐름은 범위 밖입니다.

## snapshot 검증 원칙

public-safe snapshot은 설치 진입점과 문서 링크가 self-contained 해야 합니다.

- 설치 문서에 적힌 상대 경로는 snapshot 안의 자산만 가리켜야 합니다.
- 공개 support matrix와 surface README가 같은 지원 범위를 말해야 합니다.
- 공개 skill bundle 문서는 `skills/imweb/` 아래에서 standalone으로 읽혀야 합니다.

## 설치 후 권장 읽기 순서

1. [../README.md](../README.md)
2. 대상 표면의 README와 `plugin.json`
3. [../plugin.json](../plugin.json)
4. [surface-support-matrix.md](./surface-support-matrix.md)
5. [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)
6. `imweb --output json config context`
7. `imweb --output json config command-capabilities`
8. 필요한 reference 또는 playbook 선택
9. `read -> dry-run -> yes` 순서 유지

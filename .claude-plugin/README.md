# Claude plugin surface

Claude 표면은 Claude Code와 Claude Desktop Cowork를 plugin-first 흐름으로 연결합니다. 설치 흐름은 [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md), 공개 지원 범위는 [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)를 기준으로 읽습니다.

## 이 문서에서 확인할 것

- Claude 기본 지원 범위: Claude Code, Claude Desktop Cowork
- skill 자산: `skills/imweb/`
- canonical entrypoint: `plugin.json`
- marketplace 메타: `marketplace.json`
- `manifest.json`은 compatibility entrypoint로만 유지

## 시작 경로

### Claude Code

1. `./install/install-plugins.sh --tool claude --scope user`
2. 기존 Claude Code 세션이면 `/reload-plugins`를 실행하거나 새 세션 시작
3. `/imweb-ai-toolkit:imweb`로 시작

CLI smoke나 non-interactive `claude -p` 검증처럼 plugin skill 로드를 결정적으로 확인해야 하는 경우에는 일반 요청문보다 namespaced slash 시작점을 사용합니다.

### Claude Desktop Cowork

1. `./install/install-plugins.sh --package imweb-ai-toolkit-plugin.zip`
2. Claude Desktop에서 Cowork > Customize > Browse plugins로 이동
3. custom plugin file upload로 생성한 zip을 업로드
4. 설치/활성화 후 `/imweb-ai-toolkit:imweb`로 시작

Claude Desktop Cowork는 Claude Code CLI의 `~/.claude/plugins` registry나 `~/.claude/skills`를 직접 읽지 않습니다. local Desktop 검증은 zip upload 또는 조직 배포 경로를 기준으로 합니다. Desktop 앱/계정에서 personal custom upload가 보이지 않으면 Team/Enterprise manual marketplace upload를 사용합니다. GitHub synced Cowork organization marketplace는 private/internal GitHub repo만 허용하므로 public repo는 npx/package source로 사용하고, 조직 배포에는 private/internal mirror를 둡니다.

## 공개 안내 범위

이 문서는 현재 공개되는 연결 자산만 설명합니다. Claude 표면은 plugin manifest, marketplace, package 생성 흐름, 공개 skill entrypoint, 지원 수준 문서를 source of truth로 삼습니다.

## 관련 문서

- 루트 시작점: [../README.md](../README.md)
- 설치/업데이트 계약: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- 지원 수준 해석: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- 공개 skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

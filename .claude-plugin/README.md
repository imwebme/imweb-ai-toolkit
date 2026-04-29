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
3. `/imweb` 또는 `/imweb-ai-toolkit:imweb`로 시작

CLI smoke나 non-interactive `claude -p` 검증처럼 skill 로드를 결정적으로 확인해야 하는 경우에는 일반 요청문보다 slash 시작점을 사용합니다.

### Claude Desktop Cowork

1. `./install/install-plugins.sh --package imweb-ai-toolkit-plugin.zip`
2. Claude Desktop에서 Cowork > Customize > Browse plugins로 이동
3. custom plugin file upload로 생성한 zip을 업로드

조직 배포는 `.claude-plugin/marketplace.json`을 기준으로 Team/Enterprise marketplace에 연결합니다.

## 공개 안내 범위

이 문서는 현재 공개되는 연결 자산만 설명합니다. Claude 표면은 plugin manifest, marketplace, package 생성 흐름, 공개 skill entrypoint, 지원 수준 문서를 source of truth로 삼습니다.

## 관련 문서

- 루트 시작점: [../README.md](../README.md)
- 설치/업데이트 계약: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- 지원 수준 해석: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- 공개 skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

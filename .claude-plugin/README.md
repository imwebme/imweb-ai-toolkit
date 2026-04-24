# Claude plugin surface

Claude 표면은 Claude Code와 Claude Desktop을 기본 지원 대상으로 연결하고, Claude Cowork는 문서 기반 수동 연결만 안내합니다. 설치 흐름은 [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md), 공개 지원 범위는 [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)를 기준으로 읽습니다.

## 이 문서에서 확인할 것

- Claude 기본 지원 범위: Claude Code, Claude Desktop
- 제한적 지원 범위: Claude Cowork
- skill 자산: `skills/imweb/`
- canonical entrypoint: `plugin.json`
- marketplace 메타: `marketplace.json`
- `manifest.json`은 compatibility entrypoint로만 유지

## 시작 경로

### Claude Code / Desktop

1. `./install/bootstrap-imweb.sh --tool claude --scope user`
2. Claude 세션을 시작
3. `/imweb` 또는 목적 중심 요청으로 시작

### Claude Cowork

1. `skills/imweb/`, `plugin.json`, `marketplace.json`을 기준으로 노출 자산 확인
2. [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)에서 현재 수동 연결 범위 확인
3. 필요한 연결만 직접 구성

## 공개 안내 범위

이 문서는 현재 공개되는 연결 자산만 설명합니다. Claude 표면은 bootstrap 또는 skill 설치 경로, 공개 skill entrypoint, 지원 수준 문서까지만 source of truth로 삼습니다.

## 관련 문서

- 루트 시작점: [../README.md](../README.md)
- 설치/업데이트 계약: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- 지원 수준 해석: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- 공개 skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

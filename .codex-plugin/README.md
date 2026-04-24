# Codex plugin surface

Codex 표면은 Codex CLI와 Codex App을 같은 공개 skill 번들 기준으로 연결합니다. 설치 흐름과 실행 순서는 [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md), 지원 범위는 [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)를 기준으로 읽습니다.

## 이 문서에서 확인할 것

- Codex 지원 범위: Codex CLI, Codex App
- skill 자산: `skills/imweb/`
- discovery 기본 경로: user scope 기준 `$CODEX_HOME/skills`, 없으면 `~/.codex/skills`
- 설치 후 확인은 기존 세션이 아니라 새 Codex 프로세스 기준으로 보는 편이 안전함

## 시작 경로

1. `./install/bootstrap-imweb.sh --tool codex --scope user`
2. 새 Codex 프로세스를 시작해 skill 로드 여부를 확인
3. 대화에서 `imweb-ai-toolkit:imweb` skill 또는 목적 중심 요청으로 시작

## 관련 문서

- 루트 시작점: [../README.md](../README.md)
- 설치/업데이트 계약: [../docs/skill-installation-and-usage.md](../docs/skill-installation-and-usage.md)
- 지원 수준 해석: [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)
- 공개 skill: [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)

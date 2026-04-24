# Cursor plugin surface

Cursor 표면은 `plugin.json`과 `marketplace.json`을 함께 두고, `imweb` skill 문서와 루트 `.mcp.json`을 확인하는 수동 연결 기준으로 정리합니다. 이 레포는 Cursor 전용 설치 스크립트나 자동 연결 흐름을 아직 제공하지 않으므로, plugin-first 최상위 진입점과 문서 기준을 먼저 고정합니다.

## 연결 순서

1. `imweb` CLI를 먼저 설치하거나 업데이트
2. `skills/imweb/`와 `docs/skill-installation-and-usage.md`를 기준으로 필요한 문서를 읽음
3. 워크스페이스에서 `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, `.mcp.json`을 참조해 수동 연결 지점을 확인

## 언제 보나

- Cursor 워크스페이스에서 toolkit의 최상위 plugin 진입점을 빠르게 확인하고 싶을 때
- 자동화보다 현재 공개된 문서와 MCP 연결 기준을 먼저 맞추고 싶을 때

## 참고

- 이 레포는 자체 MCP 서버를 번들하지 않습니다.
- Cursor 표면은 현재 수동 설정 기준 문서와 메타데이터를 제공합니다.
- 실제 연결 완료는 사용자가 워크스페이스 환경에 맞게 직접 확인해야 합니다.
- 지원 범위와 수동 설정 지점 차이는 [../docs/surface-support-matrix.md](../docs/surface-support-matrix.md)에서 확인합니다.

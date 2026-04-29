# Surface Support Matrix

이 문서는 `imweb-ai-toolkit`가 각 AI surface에 어떤 메타 파일을 제공하고, 어느 정도까지 안내하는지 한눈에 정리한 기준 문서입니다.

## 지원 매트릭스

| Surface | 주 메타 파일 | Marketplace 메타 | 현재 연결 방식 | 상태 |
| --- | --- | --- | --- | --- |
| Codex CLI | `.codex-plugin/plugin.json` | `.agents/plugins/marketplace.json` | `install-plugins`로 marketplace 등록 후 Plugins UI 설치, 또는 bootstrap 후 `skills/imweb/` discovery | 지원 |
| Codex App | `.codex-plugin/plugin.json` | `.agents/plugins/marketplace.json` | `install-plugins`로 marketplace 등록 후 Plugins UI 설치 | 지원 |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` | `install-plugins`로 marketplace 등록 및 plugin 설치, `/imweb-ai-toolkit:imweb`로 plugin skill 확인 | 지원 |
| Agent Skills CLI | `skills/imweb/SKILL.md` | 해당 없음 | `npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex`로 표준 Skill 설치 | 지원 |
| Claude Desktop Cowork | `imweb-ai-toolkit.plugin`, `.claude-plugin/plugin.json`, `.mcp.json`, `bin/imweb-mcp.mjs` package | `.claude-plugin/marketplace.json` | Cowork task가 `.plugin` package를 생성/검증하고 host에 install artifact로 제시. 설치 후 `/imweb-ai-toolkit:imweb` 또는 자연어 요청이 local MCP bridge를 통해 host `imweb` CLI/auth를 사용. `imweb-skill.zip`은 fallback. Claude Code registry/`~/.claude/skills`와 별개 | 지원 |
| Cursor workspace | `.cursor-plugin/plugin.json` | `.cursor-plugin/marketplace.json` | `.mcp.json` 기준 수동 연결 | 제한적 지원 |

## 해석 원칙

- `지원`: 현재 레포가 bootstrap 또는 공식 skill 설치 흐름을 문서화해 제공하는 surface입니다.
- Plugin 설치 표면에서 `지원`: 현재 레포가 marketplace metadata, plugin manifest, 설치 스크립트 또는 package 생성 흐름을 제공합니다.
- `제한적 지원`: 표면 메타와 참조 문서는 제공하지만, 전용 설치기, one-click 설치, 런타임 자동 연결은 아직 범위 밖인 surface입니다.
- `지원`이어도 실제 로드 확인과 host 앱 내부 동작은 각 surface 버전과 사용자 환경에 따라 달라질 수 있습니다.
- Codex는 repo marketplace `.agents/plugins/marketplace.json`와 plugin manifest `.codex-plugin/plugin.json`을 기준으로 설치 가능한 plugin surface를 제공합니다.
- Claude는 `plugin.json`을 canonical entrypoint로 보고, `manifest.json`은 이전 참조와의 호환성을 위한 compatibility entrypoint로만 유지합니다.
- Agent Skills CLI는 plugin auto-update 경로가 아니라 skill 파일 fallback입니다.
- Claude Desktop Cowork는 Claude Code CLI registry나 `~/.claude/skills`를 직접 읽는 surface로 취급하지 않습니다. Cowork task 안에서 computer-use로 Claude Desktop UI를 조작해 설치하는 흐름도 지원 경로가 아닙니다.
- Cowork의 shell은 VM일 수 있으므로 plugin에 포함된 local MCP bridge가 host `imweb` CLI와 auth/profile을 재사용하는 경로를 우선합니다.
- Cursor는 marketplace 메타를 제공하지만 실제 연결은 여전히 `.mcp.json`을 기준으로 수동 설정합니다.

## 권장 확인 순서

1. 루트 `plugin.json`에서 표면별 entrypoint를 확인합니다.
2. 대상 surface의 `plugin.json` 또는 `marketplace.json`을 읽습니다.
3. 설치가 필요한 표면이면 `docs/skill-installation-and-usage.md`와 `install/` 스크립트를 확인합니다.
4. 수동 연결 표면이면 해당 surface README, `.mcp.json`, `marketplace.json`을 함께 봅니다.

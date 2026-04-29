# execution contract

이 문서는 설치된 `imweb` bundle에서 따라야 하는 공통 실행 약속입니다.

## 기준

1. `imweb --help`와 해당 하위 명령의 `--help`
2. bundle 내부 `docs/commands.md`
3. 이 문서

## 필수 문맥

- 현재 profile
- `site_code`
- 인증 상태
- 현재 실행 런타임의 OS/architecture

원격 write 전에는 항상 현재 상태를 read로 먼저 확인합니다.

## CLI availability

Claude Desktop Cowork 또는 Claude plugin에서 `imweb_cli_check`, `imweb_context`, `imweb_command_capabilities`, `imweb_order_list` 같은 MCP tools가 보이면 먼저 사용합니다. 이 tools는 plugin에 포함된 local MCP bridge이며 사용자 컴퓨터의 공식 CLI와 인증 상태를 재사용합니다. `imweb_cli_install`은 사용자가 로컬 CLI 설치를 허용했을 때만 호출합니다.

MCP tool이 없을 때는 아래 순서로 확인합니다.

```bash
command -v imweb
imweb --version
```

CLI가 없으면 공식 설치 경로만 사용합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

금지 경로:

- `npm install -g imweb`
- `npm info imweb`
- `npx imweb`

npm registry의 `imweb` package는 공식 아임웹 CLI가 아닙니다.

Claude Desktop Cowork에서는 작업 shell이 사용자 Mac이 아닌 별도 Linux 런타임일 수 있습니다. MCP tool이 없고 shell 실행이 필요한 경우에만 `uname -s && uname -m`을 확인합니다. 현재 런타임에 CLI 또는 auth/profile이 없으면 사용자에게 Mac 터미널 실행을 떠넘기지 말고, 이 세션에서 막힌 조건을 명확히 보고합니다.

## write 안전 규약

- 먼저 `--dry-run`
- 대상과 입력 JSON이 확정된 뒤에만 `--yes`
- 문서와 `--help`에 없는 workflow나 숨은 파라미터는 추정하지 않음
- 사용자가 명시하지 않은 computer-use, Terminal, Claude Desktop UI 조작으로 우회하지 않음

## 자동화 출력

- 자동화는 `--output json`을 우선합니다.
- dry-run JSON과 에러 JSON은 구조화 출력으로 해석합니다.

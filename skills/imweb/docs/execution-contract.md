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

Claude Desktop Cowork 또는 Claude plugin에서 `imweb_cli_check`, `imweb_auth_status`, `imweb_auth_login`, `imweb_context`, `imweb_command_capabilities`, `imweb_order_list` 같은 MCP tools가 보이면 먼저 사용합니다. 이 tools는 plugin에 포함된 local MCP bridge이며 사용자 컴퓨터의 공식 CLI와 인증 상태를 재사용합니다. `imweb_cli_install`은 사용자가 로컬 CLI 설치를 허용했을 때만 호출합니다.

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

Claude Desktop Cowork에서는 작업 shell이 사용자 Mac이 아닌 별도 Linux 런타임일 수 있습니다. MCP tool이 없고 shell 실행이 필요한 경우에만 `uname -s && uname -m`을 확인합니다. MCP tool이 있는데 auth가 없거나 만료되어 있으면 사용자에게 Mac 터미널 실행을 떠넘기지 말고 `imweb_auth_login`으로 브라우저 로그인을 시작합니다.

## 로그인 온보딩

Auth 문제는 Claude가 절차를 이끌어야 합니다.

1. `imweb_auth_status` 또는 `imweb_auth_doctor`로 host auth 상태를 확인합니다.
2. 토큰이 없거나 refresh가 실패하면 `imweb_auth_login`을 호출합니다.
3. 사용자에게는 "브라우저가 열리면 아임웹 로그인을 완료하세요. 완료되면 제가 이어서 확인합니다." 정도로만 안내합니다.
4. tool이 끝나면 `imweb_auth_status` 또는 `imweb_context`를 다시 호출합니다.
5. auth가 healthy가 되면 원래 요청을 이어서 실행합니다.
6. profile, `site_code`, scope가 여전히 비어 있으면 부족한 항목만 짧게 보고하고 API 호출은 보류합니다.

## write 안전 규약

- 먼저 `--dry-run`
- 대상과 입력 JSON이 확정된 뒤에만 `--yes`
- 문서와 `--help`에 없는 workflow나 숨은 파라미터는 추정하지 않음
- 사용자가 명시하지 않은 computer-use, Terminal, Claude Desktop UI 조작으로 우회하지 않음

## 자동화 출력

- 자동화는 `--output json`을 우선합니다.
- dry-run JSON과 에러 JSON은 구조화 출력으로 해석합니다.

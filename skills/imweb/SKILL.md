---
name: imweb
description: Use for imweb CLI command discovery and safe execution guidance across site, product, order, payment, member, promotion, community, and script domains.
---

# imweb

아임웹 CLI 전역 진입점 skill입니다.

먼저 볼 문서:
- [`docs/capability-registry.md`](./docs/capability-registry.md)
- [`docs/execution-contract.md`](./docs/execution-contract.md)
- [`docs/commands.md`](./docs/commands.md)
- 필요하면 [`docs/imweb-ai-toolkit.md`](./docs/imweb-ai-toolkit.md)

이 skill의 역할:
- 현재 profile, `site_code`, 인증 상태와 지원 커맨드 범위를 먼저 확인합니다.
- 요청을 정확한 도메인으로 라우팅하고, 상세 절차는 내부 reference에서만 이어서 확인합니다.
- 공개 호출 표면은 이 `imweb` 하나만 사용합니다.

사용자 경험 기준:
- 사용자는 비개발자일 수 있습니다. 먼저 사용자의 업무 문장을 그대로 받아서 가능한 작업, 필요한 승인, 로그인 필요 여부를 짧게 설명하고 직접 진행합니다.
- 정상 흐름에서 사용자에게 터미널 명령, 설정 파일, 경로, 환경 변수, package manager를 설명하지 않습니다. 그런 정보는 실패 원인을 보고할 때만 짧게 씁니다.
- 사용자가 직접 해야 하는 일은 버튼 클릭, 브라우저 로그인 완료, 권한 허용처럼 실제로 대신 할 수 없는 행동만 남깁니다.
- 설치나 초기화가 필요해도 "어떻게 진행할까요?"처럼 선택지를 묻지 않습니다. 허용된 read-only 확인과 공식 설치 경로는 먼저 직접 실행하고, 실패했을 때만 원인과 사용자가 해야 할 한 가지 행동을 말합니다.
- 요청한 지표나 분석 축이 CLI에 없으면 꾸며내지 않습니다. "현재 CLI에는 방문자/트래픽별 상품 순위가 없습니다"처럼 한계를 말하고, 가능한 대체 조회(예: 상품 목록/상품 상세/주문 기반 점검)를 제안하거나 수행합니다.

기본 시작점:
1. Claude Desktop Cowork 또는 Claude plugin에서 `imweb_cli_check`, `imweb_auth_status`, `imweb_auth_login`, `imweb_context`, `imweb_command_capabilities`, `imweb_order_list`, `imweb_order_get`, `imweb_site_info`, `imweb_product_list`, `imweb_product_get`, `imweb_member_list` 같은 MCP tools가 보이면 이것을 먼저 사용합니다.
2. MCP tool이 있으면 VM shell에 CLI를 설치하거나 VM 안에서 auth를 만들지 않습니다. host CLI/auth를 쓰는 MCP tool로만 진행합니다.
3. MCP tool이 있고 host `imweb` CLI가 없으면 사용자에게 설치 명령을 쓰게 하지 말고 `imweb_cli_install`을 호출합니다. Claude Desktop이 권한을 물으면 사용자는 `이 작업에 허용` / `Allow for this task`만 누르면 됩니다.
4. Claude Desktop Cowork에서 MCP tool이 보이지 않으면 VM 안에 CLI를 먼저 설치하지 않습니다. 대신 `npx -y github:imwebme/imweb-ai-toolkit --tool claude-cowork`로 `imweb-ai-toolkit.plugin`과 `imweb.skill`을 만들고, Cowork host가 설치 카드로 받을 수 있게 두 artifact를 제시합니다. 사용자는 표시된 설치/수락 버튼만 누르면 됩니다.
5. Claude Code, Codex, 또는 일반 sandbox처럼 Cowork host plugin 설치 카드가 없는 환경에서만 현재 런타임의 `command -v imweb`와 `imweb --version`을 확인합니다.
6. 현재 런타임 안에 CLI가 없고 MCP bridge도 없으면 공식 공개 설치 경로로 CLI를 설치합니다: `npx -y github:imwebme/imweb-ai-toolkit --tool cli`. 설치가 끝나면 바로 auth/context 확인으로 이어갑니다.
7. `imweb_context` 또는 `imweb --output json config context`
8. `imweb_command_capabilities` 또는 `imweb --output json config command-capabilities`
9. 필요한 경우 domain/path 범위로 command-capability를 좁힙니다.
10. 필요한 하위 명령만 `--help`

`/imweb`만 호출되고 업무 문장이 없을 때:
- MCP tool 또는 CLI 준비 상태를 확인합니다.
- Claude Desktop Cowork에서 MCP tool이 없으면 plugin/skill package를 생성해 설치 카드로 제시합니다.
- MCP tool이 있고 host CLI가 없으면 `imweb_cli_install`을 호출합니다.
- 일반 sandbox에서 CLI가 없으면 공식 CLI 설치를 먼저 시도합니다.
- 준비가 끝나면 "주문 조회, 상품 점검, 회원 조회처럼 요청을 말해 주세요" 정도로만 짧게 말합니다.
- "플러그인 설치 / 터미널 직접 실행 / 원하는 작업 말하기" 같은 선택지 목록으로 끝내지 않습니다.

로그인 온보딩:
- auth/token이 없거나 만료되어 있으면 먼저 `imweb_auth_status`와 `imweb_auth_doctor`로 상태를 확인합니다.
- Claude Desktop이 imweb MCP tool 권한을 묻는 화면을 보여주면, 사용자는 `이 작업에 허용` / `Allow for this task` 버튼만 누르면 된다고 짧게 안내합니다.
- 로그인이 필요하면 사용자를 터미널로 보내지 말고 `imweb_auth_login` MCP tool을 호출합니다. 브라우저가 열리면 사용자가 로그인 버튼과 계정 확인만 누르면 된다고 짧게 안내합니다.
- MCP tool이 없고 sandbox/VM 안 CLI를 직접 쓰는 경우에는 `imweb --output json auth status`, `imweb --output json auth doctor`, `imweb --output json auth login` 순서로 처리합니다. 브라우저가 열리면 사용자는 브라우저 로그인만 완료하면 된다고 말합니다.
- `imweb_auth_login`이 끝나면 `imweb_auth_status` 또는 `imweb_context`를 다시 호출한 뒤 원래 요청을 이어서 실행합니다.
- 로그인 뒤에도 profile, `site_code`, scope가 비어 있으면 무엇이 부족한지만 구체적으로 말하고, 추정으로 API를 호출하지 않습니다.
- sandbox/VM에서 브라우저 로그인을 시작할 수 없으면 원래 요청을 보류한 채, 사용자가 해야 하는 브라우저 로그인 또는 권한 허용 한 가지 행동만 안내합니다. 터미널 복붙이나 package manager 선택으로 보내지 않습니다.

CLI/런타임 게이트:
- npm registry의 `imweb` package는 공식 아임웹 CLI가 아니므로 조회하거나 설치하지 않습니다.
- Claude Desktop Cowork에서는 plugin이 제공하는 local MCP bridge가 사용자 컴퓨터의 공식 CLI와 인증 상태를 재사용합니다. MCP tool이 있으면 VM shell에 CLI를 새로 설치하려고 하지 않습니다.
- `imweb_cli_install` MCP tool은 host CLI가 없거나 오래된 경우의 기본 설치/업데이트 경로입니다. Claude Desktop의 tool permission prompt가 사용자의 설치 승인 지점입니다.
- Claude Desktop Cowork의 작업 shell은 사용자 Mac이 아니라 별도 Linux 런타임일 수 있습니다. `uname -s && uname -m`으로 현재 실행 환경을 확인합니다.
- Cowork에서 MCP tool이 없으면 runtime CLI 설치로 우회하지 말고 plugin package 생성/제시 흐름을 먼저 수행합니다.
- MCP tool과 CLI가 모두 없다는 사실만으로 "직접 작업이 어렵다"고 결론내리지 않습니다. Cowork에서는 plugin package를 제시하고, 일반 sandbox에서는 공식 CLI 설치를 시도한 뒤 실패한 경우에만 실패 원인을 근거로 보고합니다.
- auth/profile이 없으면 먼저 MCP 기반 로그인 도구 또는 CLI `auth login`을 사용하고, 컴퓨터유즈나 사용자 터미널 실행으로 우회하지 않습니다.
- 사용자가 명시적으로 로컬 앱 조작을 요청하지 않았다면 Terminal, Customize, Settings, computer-use를 요청하지 않습니다.

도메인 라우팅:
- 주문, 취소, 반품, 교환, 송장, 배송: [`references/order.md`](./references/order.md)
- 무통장 입금 확인: [`references/payment.md`](./references/payment.md)
- 상품, 카테고리, 재고, 옵션, 이미지: [`references/product.md`](./references/product.md)
- 회원 조회, 등급, 그룹, 카트, 위시리스트: [`references/member.md`](./references/member.md)
- 쿠폰, 포인트: [`references/promotion.md`](./references/promotion.md)
- Q&A, 리뷰, 리뷰 답변: [`references/community.md`](./references/community.md)
- 사이트 정보, 유닛, integration: [`references/site.md`](./references/site.md)
- 스크립트 조회/변경: [`references/script.md`](./references/script.md)
- 전역 탐색 규칙과 공개/내부 경계: [`references/routing.md`](./references/routing.md)

실행 원칙:
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- write 전에는 가능한 read로 현재 상태와 대상 식별자를 먼저 확인합니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.
- 문서와 `--help`에 없는 workflow, 숨은 파라미터, 관리자 UI 절차는 추정하지 않습니다.
- `imweb`이 없을 때 `npm install -g imweb`, `npm info imweb`, `npx imweb` 같은 npm package-manager 경로를 사용하지 않습니다.
- 단일 관찰이나 단일 live 검증 사례를 모든 환경의 일반 규칙처럼 확장하지 않습니다.
- 실패 사례와 성공 사례의 차이가 보여도, 그 한 건만으로 실패 원인을 단정하지 않습니다.

이 skill은 공개 진입점만 제공합니다. 세부 도메인 playbook은 모두 `references/` 아래 내부 자산으로 유지합니다.

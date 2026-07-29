# commands quick guide

이 문서는 설치된 bundle 안에서 빠르게 다시 볼 최소 command 안내서입니다.

## 공통 시작점

- `command -v imweb`
- `imweb --version`
- `imweb --output json config context`
- `imweb --output json config command-capabilities`

`imweb` CLI가 없으면 공식 toolkit installer만 사용합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

`npm install -g imweb`, `npm info imweb`, `npx imweb`는 사용하지 않습니다. npm registry의 `imweb` package는 공식 아임웹 CLI가 아닙니다.

## 대표 도메인 진입

- `imweb site --help`
- `imweb order --help`
- `imweb product --help`
- `imweb member --help`
- `imweb promotion --help`
- `imweb community --help`
- `imweb payment --help`
- `imweb script --help`

## OpenAPI 2026-07 동기화

아래 경로는 `imweb` CLI 0.1.13 이상에서 확인합니다.

```bash
imweb site menu --unit-code uxxxxxxxxxxxxxxxxxxxx
imweb order shipping-places --unit-code uxxxxxxxxxxxxxxxxxxxx
imweb order list --shipping-place-code SP0001 --order-section-status EXCHANGE_COMPLETE
imweb product options batch --prod-no 10000001 --prod-no 10000002
imweb member list --recommend-code REF1 --edit-time-range-type GTE --edit-time-range-value 2026-01-01T00:00:00.000Z
imweb promotion coupon targets by-coupon cxxxxxxxxxxxxxxxxxxxx
imweb promotion point log --member-uid mxxxxxxxxxxxxxxxxxxxx
imweb community forms list
imweb community form-submissions list --form-no 1
```

- 상품 옵션 일괄 조회는 상품 번호 최대 10개입니다.
- 입력폼 제출 응답은 개인정보와 자유 입력값을 포함할 수 있으므로 필요한 필드만 사용합니다.
- 회원 등급/그룹 일괄 변경, 쿠폰 생성/일괄·그룹 발급은 CLI write 경로입니다. MCP bridge는 이번 변경에서도 read-only 도구만 노출합니다.

## 원칙

- `imweb --version`으로 0.1.13 이상인지 확인한 뒤 새 경로를 사용합니다.
- 세부 인자 형태는 항상 실제 `--help`를 다시 확인합니다.
- 자동화는 `--output json`을 우선 사용합니다.
- write는 `--dry-run` 후 `--yes` 순서를 지킵니다.
- 현재 런타임이 Claude Desktop Cowork이면 `uname -s && uname -m`으로 실행 환경을 확인하고, 사용자 Mac과 같은 환경이라고 가정하지 않습니다.

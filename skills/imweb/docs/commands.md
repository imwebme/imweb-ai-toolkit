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

- 기능별 최소 버전과 실제 capability/help를 확인한 뒤 새 경로를 사용합니다.
- 세부 인자 형태는 항상 실제 `--help`를 다시 확인합니다.
- 자동화는 `--output json`을 우선 사용합니다.
- write는 `--dry-run` 후 `--yes` 순서를 지킵니다.
- 현재 런타임이 Claude Desktop Cowork이면 `uname -s && uname -m`으로 실행 환경을 확인하고, 사용자 Mac과 같은 환경이라고 가정하지 않습니다.

## 상품 이미지와 옵션 색상·썸네일

CLI **0.1.14 이상**이 필요합니다. 이전 버전에서는 공식 설치 경로로 업데이트하고 버전과 capability를 다시 확인합니다. 여전히 지원하지 않으면 해당 작업을 보류합니다.

```bash
imweb --output json config command-capabilities --path "product images upload-asset"
imweb --output json config command-capabilities --path "product update option"
imweb --output json product images upload-asset --file red.png --dry-run
imweb --output json product options get 10000001 O_OPTION --unit-code u_UNIT
imweb --output json product update option 10000001 O_OPTION --unit-code u_UNIT --data '{"optionValueList":[{"optionValueCode":"O_VALUE","optionValueName":"Red","color":"#FF0000"}]}' --dry-run
```

- `red.png`와 예시 식별자는 실제 파일과 조회값으로 바꿉니다. 업로드는 반복 `--file`을 받고 상품 번호·unitCode가 필요하지 않습니다.
- 업로드 결과 `data.images[]`의 `code/path`를 옵션 값의 `imageCode/imagePath`로 함께 전달합니다. 썸네일은 비조합 선택형·색상형 옵션만 지원합니다.
- 옵션 수정 실행에는 같은 요청의 dry-run에서 받은 `confirmation_token`을 `--yes --confirm-token`과 함께 사용합니다.
- 전체 절차와 검증 규칙은 [상품 실행](../references/product.md)을 따릅니다. MCP는 조회만 지원합니다.

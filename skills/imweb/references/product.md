# 상품 실행

이 문서는 상품 관련 내부 playbook입니다.

## 범위
- 상품 조회/생성
- 상품 정보, 가격, 상태, 재고, 옵션 조회와 관련 업데이트
- 카테고리/쇼케이스/배송설정 조회
- 상품 이미지 업로드, 옵션 색상 수정과 썸네일 등록·변경

## 하지 않는 일
- 주문/배송 처리
- 사이트 기본 설정/연동 변경
- 문서에 없는 상품 편집 workflow 추정

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain product`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "product update"`
- 대표 leaf 예시: `product list`, `product create`, `product options list`, `product options batch`, `product update price`, `product images upload`, `product images upload-asset`, `product update option`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 상품 ID와 필요한 `unitCode`

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 여러 상품의 옵션 조회는 `product options batch --prod-no ...`를 사용하며 한 요청에 최대 10개 상품만 전달합니다. MCP에서는 `imweb_product_options_batch`가 같은 제한을 적용합니다.
- 변경 전에는 `list`/`get`과 관련 조회 커맨드로 현재 상태를 먼저 확인합니다.
- write는 항상 `--dry-run`을 먼저 실행합니다.
- payload와 대상이 확정된 뒤에만 `--yes`를 사용합니다.

## 이미지와 옵션 작업의 버전·실행 환경

- `product images upload-asset`와 옵션의 `color`, `imageCode`, `imagePath` 수정은 CLI **0.1.14 이상**에서 사용합니다. `imweb --version`과 아래 exact path의 capability/help를 확인합니다.

```bash
imweb --output json config command-capabilities --path "product images upload-asset"
imweb --output json config command-capabilities --path "product update option"
imweb product images upload-asset --help
imweb product update option --help
```

- 이전 버전이면 공식 설치 경로로 업데이트한 뒤 버전과 capability를 다시 확인합니다. 필요한 버전이나 경로가 없으면 지원되지 않는 작업을 보류하고 이유를 알립니다. 업데이트를 반복하거나 다른 API로 우회하지 않습니다.
- CLI 직접 실행이 가능한 Codex/Claude Code 등에서는 아래 write 절차를 사용합니다. `product:write` 권한과 현재 사이트를 확인합니다.
- Claude Desktop local MCP/Cowork에서는 기존 `imweb_product_get`, `imweb_product_options_batch`로 현재 상태를 조회합니다. MCP는 이미지 업로드나 옵션 수정 도구를 제공하지 않습니다. 해당 변경은 CLI 실행 환경에서 지원한다고 안내하고, Cowork VM shell이나 raw API로 우회하지 않습니다.

## 업로드 목적 선택

| 목적 | CLI 경로 | 입력과 결과 |
| --- | --- | --- |
| 상품 썸네일 목록에 이미지 추가 | `product images upload <PROD_NO>` | 대상 상품 번호와 반복 `--file` |
| 옵션에 연결할 이미지 업로드 | `product images upload-asset` | 상품 번호·unitCode 없이 반복 `--file`; `data.images[]`의 `code`, `path`, `url` 반환 |

`upload-asset`은 이미지를 올리는 단계입니다. 상품 썸네일 목록에 추가하거나 옵션에 자동 연결하지 않습니다. jpg/jpeg/png/gif 파일을 사용하며, 빈 파일·확장자와 시그니처 불일치·200MiB 초과 파일은 CLI가 거부합니다. 서버는 이미지 디코딩과 사이트별 한도(일반 20MiB, 아임터보 200MiB/파일)를 최종 검증합니다.

## 옵션 색상 수정

1. `product get <PROD_NO>`와 `product options get <PROD_NO> <OPTION_CODE>`를 JSON으로 조회합니다. 실제 `unitCode`, 옵션 코드, 값 코드와 현재 이름을 확보합니다.
2. `optionValueList`의 수정할 항목에 기존 `optionValueCode`와 `optionValueName`을 함께 넣습니다. 이름 변경 요청이 없으면 조회한 이름을 그대로 유지합니다.
3. `color`는 `#RRGGBB` 형식으로 지정합니다. 생략하면 기존 색상이 유지되며, null과 빈 문자열로 지우는 기능은 지원하지 않습니다. `optionValueList`는 생략할 수 있지만 전달한다면 비어 있지 않은 배열이어야 합니다.
4. 아래처럼 dry-run으로 대상과 payload를 확인합니다. 예시 식별자는 실제 조회값으로 바꿉니다.

```bash
imweb --output json product options get 10000001 O_OPTION --unit-code u_UNIT
imweb --output json product update option 10000001 O_OPTION --unit-code u_UNIT --data '{"optionValueList":[{"optionValueCode":"O_VALUE","optionValueName":"Red","color":"#FF0000"}]}' --dry-run
```

실행이 승인된 범위에서 같은 인자의 `--dry-run`을 `--yes --confirm-token <CONFIRMATION_TOKEN>`으로 바꿉니다. 토큰은 직전 dry-run의 `confirmation_token`을 사용합니다. 대상이나 payload가 바뀌면 dry-run을 다시 수행합니다. 실행 후 같은 옵션을 재조회해 `color`와 이름을 확인합니다.

## 옵션 썸네일 등록·변경

1. 업로드 전에 상품과 옵션을 조회하고 **비조합 선택형·색상형 옵션**인지 확인합니다. 상품의 `optionMixType`과 옵션의 `type`을 확인하고, 조합형·입력형이거나 유형이 불명확하면 업로드를 진행하지 않습니다. 유형을 임의로 변경하지 않습니다.
2. 현재 사이트에서 로컬 파일을 업로드합니다. `red.png`는 실제 파일 경로로 바꿉니다.

```bash
imweb --output json product images upload-asset --file red.png --dry-run
imweb --output json product images upload-asset --file red.png --yes
```

3. 실제 업로드 응답 `data.images[]`에서 해당 이미지의 `code`와 `path`를 함께 가져옵니다. 아래 `f_IMAGE`와 `S_SITE/red.png`를 그 값으로 바꿉니다. `url`이나 기존 옵션 조회의 `imageUrl`로 `imagePath`를 대신하거나, URL에서 code/path를 추정하지 않습니다. 여러 파일을 올렸다면 옵션 값과 이미지의 대응도 확인합니다.

```bash
imweb --output json product update option 10000001 O_OPTION --unit-code u_UNIT --data '{"optionValueList":[{"optionValueCode":"O_VALUE","optionValueName":"Red","imageCode":"f_IMAGE","imagePath":"S_SITE/red.png"}]}' --dry-run
```

4. 같은 인자의 `--dry-run`을 `--yes --confirm-token <CONFIRMATION_TOKEN>`으로 바꾸어 실행합니다. 색상도 함께 바꿀 때만 같은 항목에 `color`를 추가합니다. 같은 사이트의 이미지 코드와 저장 경로가 모두 필요하며, 소유권과 옵션 유형은 서버가 최종 검증합니다.
5. 옵션을 JSON으로 다시 조회해 `imageUrl`과 요청한 색상·이름을 확인합니다. 업로드 후 옵션 연결이 실패하면 업로드 성공과 연결 실패를 구분해 보고합니다. 연결하지 않은 파일은 임시 이미지로 남으므로 완료로 보고하거나 파일을 무조건 다시 업로드하지 않습니다.

CLI가 노출하지 않은 필드, 업로드 절차, 일괄 처리 규칙은 추정하지 않습니다. 필요한 하위 명령과 입력 형태는 항상 `--help`로 다시 확인합니다.

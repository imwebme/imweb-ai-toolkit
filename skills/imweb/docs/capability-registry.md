# capability registry

이 문서는 설치된 `imweb` bundle 안에서 command truth를 읽는 최소 기준입니다.

## 먼저 확인할 명령

1. `imweb --output json config context`
2. `imweb --output json config command-capabilities`

## 읽는 순서

1. `config context`로 현재 profile, `site_code`, 인증 상태, readiness를 확인합니다.
2. `config command-capabilities`로 지원 domain/path를 좁힙니다.
3. 필요한 leaf path의 `--help`를 다시 확인합니다.

## 핵심 해석 원칙

- `domain`은 공개 skill 분리 축이 아니라 내부 reference 라우팅 축입니다.
- `surface=group`이면 `public_leaf_paths`를 따라 실제 leaf를 다시 확인합니다.
- `risk_level`, `recommended_read_paths`, `preferred_input_modes`, `input_contract`를 우선 읽습니다.
- CLI 버전에 따라 registry가 달라집니다. 2026-07 조회 경로는 0.1.13 이상, 이미지 전용 업로드와 옵션 색상·썸네일 수정은 0.1.14 이상인지 확인하고 실제 path의 capability/help를 읽습니다.
- MCP bridge는 registry 전체를 그대로 도구화하지 않습니다. read-only 경로만 선별하고, 입력폼 제출·회원·주문·프로모션 응답은 기본 마스킹 또는 축약을 추가합니다.
- `member update grade-bulk|groups-bulk`, `promotion coupon create|issue-bulk|issue-group`처럼 변경을 일으키는 새 경로는 CLI의 `risk_level`, `input_contract`, bulk confirmation 계약을 따릅니다.
- `product images upload-asset`은 반복 `--file`이 authoritative 입력이며 상품 번호·unitCode·JSON body를 받지 않습니다. `product update option`은 상품/옵션 식별자와 unitCode, JSON payload를 사용합니다. 두 write 경로 모두 MCP에는 노출하지 않습니다.

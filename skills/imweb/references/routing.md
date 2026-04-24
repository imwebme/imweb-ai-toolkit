# imweb 라우팅과 경계

이 문서는 공개 `imweb` skill 내부에서만 참조하는 내부 가이드입니다.

## 공개 표면
- 사용자가 설치하거나 호출하는 skill은 `imweb` 하나만 가정합니다.
- 도메인별 지식은 별도 공개 skill이 아니라 이 skill 내부 reference로만 유지합니다.
- 이후 installer와 README는 이 공개 표면을 기준으로 정리할 수 있어야 합니다.

## 전역 탐색 범위
- 현재 profile, `site_code`, 인증 상태 확인
- 상위/하위 커맨드 탐색
- 사용자의 요청을 적절한 도메인 reference로 라우팅

## 먼저 확인할 커맨드
- `imweb --output json config context`
- `imweb --output json config command-capabilities`
- `imweb --output json config command-capabilities --domain <bootstrap|site|order|product|member|promotion|community|payment|script|api>`
- `imweb --output json config command-capabilities --path "<exact path>"`
- 필요한 하위 커맨드의 `--help`

## 기본 흐름
1. `config context`로 profile, `site_code`, 인증 상태와 `remote_context.ready`를 확인합니다.
2. `config command-capabilities`로 공개 domain/path를 확인하고 요청을 맞는 도메인 reference로 라우팅합니다.
3. 필요한 leaf/group path만 `--help`로 다시 확인합니다.

## 라우팅 규칙
- 주문/배송/CS 흐름이면 `order.md`를 먼저 봅니다.
- 무통장 입금 확인이면 `payment.md`를 먼저 봅니다.
- 상품/카테고리/재고/이미지면 `product.md`를 먼저 봅니다.
- 회원 조회, 등급, 그룹이면 `member.md`를 먼저 봅니다.
- 쿠폰/포인트면 `promotion.md`를 먼저 봅니다.
- Q&A/리뷰면 `community.md`를 먼저 봅니다.
- 사이트 정보/유닛/integration이면 `site.md`를 먼저 봅니다.
- 사이트 스크립트면 `script.md`를 먼저 봅니다.

## 공통 실행 원칙
- 먼저 read
- 그다음 `--dry-run`
- 의도와 입력이 확정된 뒤에만 `--yes`
- 없는 기능을 사실처럼 말하지 않음

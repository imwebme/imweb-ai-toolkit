# 커뮤니티 실행

이 문서는 입력폼 제출, Q&A, 리뷰 관련 내부 playbook입니다.

## 범위
- 입력폼 정의 목록/상세 조회
- 입력폼 제출 목록/상세 조회
- Q&A 목록/상세 조회
- Q&A 답변 등록
- 리뷰 목록/커서/상세 조회
- 리뷰 생성/수정/삭제
- 리뷰 답변 조회/생성/삭제

## 하지 않는 일
- 문서에 없는 신고, 숨김, moderation workflow 추정
- 회원/주문/상품 도메인 작업
- CLI가 노출하지 않은 커뮤니티 관리자 화면 절차 가정

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain community`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "community review create"`
- 대표 leaf 예시: `community forms list`, `community form-submissions list`, `community qna list`, `community qna answer`, `community review cursor`, `community review update`, `community review-answer create`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 입력폼 번호/제출 코드, Q&A 번호 또는 리뷰 번호

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- read는 `imweb community forms list|get`, `imweb community form-submissions list|get`, `imweb community qna list|get`, `imweb community qna-answer list`, `imweb community review list|cursor|get`, `imweb community review-answer list`로 먼저 확인합니다.
- 입력폼 목록/제출 목록의 시간 범위는 `GTE`, `LTE`, `BETWEEN`과 1개 또는 2개의 시간 값을 함께 전달합니다.
- MCP 입력폼 제출 도구는 임의 응답값을 기본 제거하고 회원 식별자를 마스킹합니다. 원문이 꼭 필요한 경우에만 `compact=false`를 쓰고, `redactSensitive=false`는 사용자가 원문 노출을 명시적으로 요구한 경우에만 함께 사용합니다.
- write는 `imweb community qna answer`, `imweb community review create|update|delete`, `imweb community review-answer create|delete`만 다룹니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

입력폼, Q&A, 리뷰는 문서에 나온 read/write surface만 다룹니다. 없는 답변 수정 흐름이나 별도 승인 절차는 사실처럼 쓰지 않습니다.

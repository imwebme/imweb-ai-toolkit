# 프로모션 실행

이 문서는 쿠폰과 포인트 관련 내부 playbook입니다.

## 범위
- 쿠폰 목록/상세 조회
- 쿠폰 발급 이력 조회
- 지정 발행 대상 조회
- 쿠폰 생성, 회원 일괄 발급, 등급/그룹 발급
- 포인트 현황/로그 조회
- 회원 기준 또는 사유(type) 기준 포인트 변경

## 하지 않는 일
- 회원 등급/그룹 변경 같은 member 운영
- 주문/결제/배송 처리
- 문서와 `--help`에 없는 프로모션 운영 workflow 추정

## 관련 reference
- 회원 조회나 회원 식별이 먼저 필요하면 `member.md`를 보조로 참고합니다.

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain promotion`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "promotion point change"`
- 대표 leaf 예시: `promotion coupon list`, `promotion coupon get`, `promotion coupon targets by-coupon`, `promotion coupon targets by-member`, `promotion coupon create`, `promotion coupon issue-bulk`, `promotion coupon issue-group`, `promotion point list`, `promotion point log`, `promotion point change member`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 필요한 `unitCode`
- 대상 회원 ID 또는 쿠폰 코드

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 쿠폰 목록 수정일과 포인트 로그 시간 범위는 `GTE`, `LTE`, `BETWEEN`과 1개 또는 2개의 시간 값을 함께 전달합니다.
- MCP의 쿠폰 대상/포인트 로그 도구는 read-only이며 회원·관리자·주문 식별자를 기본 마스킹합니다. 쿠폰 생성·발급과 포인트 변경은 MCP에 노출하지 않습니다.
- `coupon issue-bulk`는 회원을 최대 50명까지 받으며, `coupon create`, `issue-bulk`, `issue-group`은 CLI에서 dry-run/확인 절차를 거칩니다.
- write 전에는 관련 `list`/`get`/`issues`/`log`로 현재 상태와 대상 식별자를 먼저 확인합니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

현재 공개 playbook은 있습니다. 기본 절차는 [`../docs/scenario-playbooks.md`](../docs/scenario-playbooks.md)의 포인트 변경/쿠폰 발급 항목을 따르고, 쿠폰 발급 순서, 포인트 운영 정책, 승인 절차 같은 업무 규칙은 그 문서와 공개 surface 밖으로 추정하지 않습니다.

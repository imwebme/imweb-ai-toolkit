# 회원 실행

이 문서는 회원 관련 내부 playbook입니다.

## 범위
- 회원 목록/상세 조회
- 회원 카트/위시리스트 조회
- 등급/그룹과 소속 회원 조회
- 회원 등급/그룹 update

## 하지 않는 일
- 쿠폰 발급, 포인트 변경 같은 promotion 실행
- 주문/상품/커뮤니티 작업
- 문서와 `--help`에 없는 회원 운영 workflow 추정

## 관련 reference
- 쿠폰/포인트 자체가 목적이면 `promotion.md`를 먼저 봅니다.

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain member`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "member update"`
- 대표 leaf 예시: `member list`, `member get`, `member grades members`, `member groups members`, `member update grade`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 회원 ID와 필요한 `unitCode`

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 변경 전에는 관련 `list`/`get`으로 현재 상태를 먼저 읽습니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

없는 등급/그룹 정책이나 관리자 workflow는 추정하지 않습니다. 필요한 하위 명령과 입력 형태는 항상 `--help`와 문서 기준으로 다시 확인합니다.

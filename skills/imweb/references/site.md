# 사이트 실행

이 문서는 사이트 정보와 integration 관련 내부 playbook입니다.

## 범위
- 사이트 정보 조회
- 사이트 유닛 확인
- CLI가 노출한 integration 관련 실행

## 하지 않는 일
- 주문/상품 도메인 실행
- CLI에 없는 사이트 설정 화면 동작 추정
- 비공개 연동 파라미터나 숨은 API workflow 가정

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain site`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "site integration complete"`
- 대표 leaf 예시: `site info`, `site unit`, `site integration info`, `site integration complete`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 필요한 경우 `unitCode`

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 먼저 `info`/`unit`으로 현재 상태를 읽습니다.
- `site integration info|complete|cancellation`은 integration write/operation 계열로 다룹니다.
- 변경성 호출은 `--dry-run`으로 요청을 확인합니다.
- 입력과 대상이 확정된 뒤에만 `--yes`를 사용합니다.

사이트 도메인은 문서화된 CLI 범위만 다룹니다. 없는 integration 흐름이나 관리자 UI 절차를 사실처럼 쓰지 않습니다.

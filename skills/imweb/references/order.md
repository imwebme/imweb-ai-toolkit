# 주문 실행

이 문서는 주문, 배송, CS 관련 내부 playbook입니다.

## 범위
- 주문 조회
- 취소/반품/교환 요청의 승인/반려 처리
- 송장 생성/수정/삭제
- 배송 상태 변경, 택배사/섹션/아이템 조회

## 하지 않는 일
- `payment bank-transfer-confirm` 같은 payment 전용 write
- 상품/카테고리 관리
- 사이트 설정/연동 변경
- 문서와 `--help`에 없는 주문 운영 workflow 추정

## 관련 reference
- 무통장 입금 확인이 목적이면 `payment.md`를 먼저 봅니다.

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain order`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "order invoice"`
- 대표 leaf 예시: `order list`, `order invoice create`, `order section cancel approve`, `order item invoice create`, `order shipping operation`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 주문/섹션/아이템 식별자

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 변경 전에는 반드시 관련 `list`/`get`으로 현재 상태를 읽습니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

없는 기능이나 승인 절차를 추정하지 않습니다. payment 전용 write가 필요하면 payment reference를 우선 보고, 필요한 하위 커맨드가 보이지 않으면 `--help`와 문서 기준으로 가능한 범위만 안내합니다.

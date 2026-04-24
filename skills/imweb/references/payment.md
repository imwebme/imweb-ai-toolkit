# 결제 실행

이 문서는 무통장 입금 확인 관련 내부 playbook입니다.

## 범위
- `payment bank-transfer-confirm` 실행
- 결제 확인 전 대상 주문 재확인
- 결제 확인 실패 시 대상 주문 번호와 현재 상태 재검증

## 하지 않는 일
- 송장 등록, 배송 상태 변경, 취소/반품/교환 승인 같은 주문 운영 전반
- 별도 결제 취소/환불 workflow 추정
- 문서와 `--help`에 없는 결제 운영 절차 발명

## 관련 reference
- 주문/배송/CS 처리 전반이면 `order.md`를 먼저 봅니다.
- read 보조는 `order list|get`이므로 주문 조회 자체는 `order.md`를 참고해도 됩니다.

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain payment`
- 보조 read exact 확인이 필요하면 `imweb --output json config command-capabilities --path "order get"`
- 대표 leaf 예시: `payment bank-transfer-confirm`, `order list`, `order get`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 주문 번호

## 실행 원칙
- payment 도메인 write는 이 reference를 우선 기준으로 삼고, 실제 read 보조 surface는 registry에서 `payment`와 `order`를 함께 확인합니다.
- 직접적인 payment read 커맨드는 없으므로 변경 전에는 `order list|get`로 대상 주문을 먼저 읽습니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상 주문 번호와 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

현재 공개 playbook은 있습니다. 기본 절차는 [`../docs/scenario-playbooks.md`](../docs/scenario-playbooks.md)의 무통장 입금 확인 항목을 따르고, 결제 승인 절차나 예외 처리 정책은 그 문서와 공개 surface 밖으로 추정하지 않습니다. 안내는 `payment bank-transfer-confirm`와 `order list|get` 범위 안에서만 진행합니다.

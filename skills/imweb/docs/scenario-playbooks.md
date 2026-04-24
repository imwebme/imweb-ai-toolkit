# scenario playbooks

이 문서는 설치된 bundle 안에서 반복 운영 흐름을 짧게 연결하는 최소 안내서입니다.

## 현재 포함 범위

- 무통장 입금 확인
- 상품 수정 전 read -> dry-run -> yes 순서
- 회원 등급/그룹 변경 전 선행 조회
- 포인트 변경과 쿠폰 발급 전 대상 식별
- 스크립트 create/update/delete 전 현재 상태 조회

## 원칙

- write 전에는 항상 관련 read path로 현재 상태를 먼저 확인합니다.
- `--dry-run` 결과를 검토한 뒤에만 `--yes`를 고려합니다.

## 무통장 입금 확인

1. `imweb --output json config context`
2. `imweb --output json config command-capabilities --domain payment`
3. `order list` 또는 `order get <orderNo>`로 대상 주문과 결제 상태 확인
4. `imweb payment bank-transfer-confirm <orderNo> --dry-run`
5. dry-run 결과와 대상 주문 번호가 맞는지 다시 확인한 뒤에만 `--yes`

주의:

- payment 전용 read surface가 없으므로 선행 조회는 `order list|get`를 사용합니다.
- 결제 승인 가능 상태나 내부 운영 정책은 공개 surface 밖으로 추정하지 않습니다.

## 포인트 변경과 쿠폰 발급

1. `imweb --output json config context`
2. `imweb --output json config command-capabilities --domain promotion`
3. 회원 ID, 쿠폰 코드, `unitCode` 같은 대상 식별자 확보
4. 관련 공개 leaf path로 현재 상태 확인
   - `imweb promotion coupon list`
   - `imweb promotion coupon get <couponCode>`
   - `imweb promotion coupon issues by-member <memberId>`
   - 필요하면 `imweb promotion coupon issues by-coupon <couponCode>`
   - `imweb promotion point list`
   - `imweb promotion point log`
5. `imweb promotion coupon issue --dry-run` 또는 `imweb promotion point change member --dry-run`
6. dry-run 결과와 대상 식별자가 맞는지 확인한 뒤에만 `--yes`

주의:

- 쿠폰 발급 순서, 포인트 운영 승인 규칙은 공개 문서와 `--help` 밖으로 추정하지 않습니다.
- 실제 write 전에는 관련 read 결과를 다시 확인합니다.

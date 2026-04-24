# 상품 실행

이 문서는 상품 관련 내부 playbook입니다.

## 범위
- 상품 조회/생성
- 상품 정보, 가격, 상태, 재고, 옵션 관련 업데이트
- 카테고리/쇼케이스/배송설정 조회
- 상품 이미지 업로드

## 하지 않는 일
- 주문/배송 처리
- 사이트 기본 설정/연동 변경
- 문서에 없는 상품 편집 workflow 추정

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain product`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "product update"`
- 대표 leaf 예시: `product list`, `product create`, `product options list`, `product update price`, `product images upload`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 상품 ID와 필요한 `unitCode`

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 변경 전에는 `list`/`get`과 관련 조회 커맨드로 현재 상태를 먼저 확인합니다.
- write는 항상 `--dry-run`을 먼저 실행합니다.
- payload와 대상이 확정된 뒤에만 `--yes`를 사용합니다.

CLI가 노출하지 않은 필드, 업로드 절차, 일괄 처리 규칙은 추정하지 않습니다. 필요한 하위 명령과 입력 형태는 항상 `--help`로 다시 확인합니다.

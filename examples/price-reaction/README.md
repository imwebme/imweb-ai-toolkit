# price-reaction example

이 예시는 경쟁사 가격 snapshot과 상품 정책 fixture를 바탕으로 `imweb` 가격 변경 dry-run 계획을 만드는 샘플입니다.

- `run.py`: 계획 생성 엔트리포인트
- `fixtures/`: 예시 입력 JSON
- `smoke-fixture.sh`: fixture 기반 smoke 검증
- `smoke-real-dry-run.sh`: PATH의 `imweb` 또는 `IMWEB_BIN`으로 지정한 CLI를 붙인 dry-run smoke 예시

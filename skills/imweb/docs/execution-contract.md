# execution contract

이 문서는 설치된 `imweb` bundle에서 따라야 하는 공통 실행 약속입니다.

## 기준

1. `imweb --help`와 해당 하위 명령의 `--help`
2. bundle 내부 `docs/commands.md`
3. 이 문서

## 필수 문맥

- 현재 profile
- `site_code`
- 인증 상태

원격 write 전에는 항상 현재 상태를 read로 먼저 확인합니다.

## write 안전 규약

- 먼저 `--dry-run`
- 대상과 입력 JSON이 확정된 뒤에만 `--yes`
- 문서와 `--help`에 없는 workflow나 숨은 파라미터는 추정하지 않음

## 자동화 출력

- 자동화는 `--output json`을 우선합니다.
- dry-run JSON과 에러 JSON은 구조화 출력으로 해석합니다.

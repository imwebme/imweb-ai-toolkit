# commands quick guide

이 문서는 설치된 bundle 안에서 빠르게 다시 볼 최소 command 안내서입니다.

## 공통 시작점

- `imweb --output json config context`
- `imweb --output json config command-capabilities`

## 대표 도메인 진입

- `imweb site --help`
- `imweb order --help`
- `imweb product --help`
- `imweb member --help`
- `imweb promotion --help`
- `imweb community --help`
- `imweb payment --help`
- `imweb script --help`

## 원칙

- 세부 인자 형태는 항상 실제 `--help`를 다시 확인합니다.
- 자동화는 `--output json`을 우선 사용합니다.
- write는 `--dry-run` 후 `--yes` 순서를 지킵니다.

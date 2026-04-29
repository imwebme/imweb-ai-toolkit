# commands quick guide

이 문서는 설치된 bundle 안에서 빠르게 다시 볼 최소 command 안내서입니다.

## 공통 시작점

- `command -v imweb`
- `imweb --version`
- `imweb --output json config context`
- `imweb --output json config command-capabilities`

`imweb` CLI가 없으면 공식 toolkit installer만 사용합니다.

```bash
npx -y github:imwebme/imweb-ai-toolkit --tool cli
```

`npm install -g imweb`, `npm info imweb`, `npx imweb`는 사용하지 않습니다. npm registry의 `imweb` package는 공식 아임웹 CLI가 아닙니다.

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
- 현재 런타임이 Claude Desktop Cowork이면 `uname -s && uname -m`으로 실행 환경을 확인하고, 사용자 Mac과 같은 환경이라고 가정하지 않습니다.

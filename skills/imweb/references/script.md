# 스크립트 실행

이 문서는 사이트 스크립트 관련 내부 playbook입니다.

## 범위
- 현재 스크립트 목록 조회
- 스크립트 생성/수정/삭제

## 하지 않는 일
- 사이트 전체 설정 변경
- CLI에 없는 스크립트 배포 workflow 추정
- 문서에 없는 위치나 숨은 파라미터 가정

## 우선 확인할 registry/대표 path
- `imweb --output json config command-capabilities --domain script`
- exact 확인이 필요하면 `imweb --output json config command-capabilities --path "script update"`
- 대표 leaf 예시: `script list`, `script create`, `script update`, `script delete`

## 실행 전 체크
- 현재 profile
- `site_code`
- 인증 상태
- 대상 `unitCode`와 `position`

## 실행 원칙
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- 변경 전에는 `script list`로 현재 상태를 먼저 읽습니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.

## 예시 payload
- 아래 예시는 `scriptContent` 입력 형태를 설명하기 위한 중립 예시입니다.
- Claude 표면 연결 기준은 bundle 내부 `../docs/execution-contract.md`와 `../docs/capability-registry.md`를 기준으로 읽습니다.

```bash
imweb script create --dry-run --data '{"unitCode":"uxxxxxxxxxxxxxxxxxxxx","position":"header","scriptContent":"<script>/* example-header-script */</script>"}'
imweb script update --dry-run --data '{"unitCode":"uxxxxxxxxxxxxxxxxxxxx","position":"header","scriptContent":"<script>/* example-header-script-v2 */</script>"}'
```

스크립트 도메인은 CLI가 노출한 위치와 입력 형태만 다룹니다. 없는 템플릿 규칙이나 배포 절차를 추정하지 않습니다.

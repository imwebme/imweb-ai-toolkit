# imweb AI toolkit

이 문서는 설치된 `imweb` bundle이 어떤 역할을 하는지 설명합니다.

## 역할

- 공개 진입점 skill `imweb`
- 도메인별 내부 reference
- 실행 계약과 capability 해석용 최소 문서

## 경계

- 이 bundle은 CLI 바이너리 자체를 포함하지 않습니다.
- 실제 실행은 별도로 설치된 `imweb` CLI가 담당합니다.
- bundle은 공개 surface를 안전하게 읽고 라우팅하는 문서/skill 자산입니다.
- 공식 CLI 설치는 `npx -y github:imwebme/imweb-ai-toolkit --tool cli` 또는 public release installer를 사용합니다.
- npm registry의 `imweb` package는 공식 아임웹 CLI가 아닙니다.
- Claude Desktop Cowork의 작업 shell은 사용자 Mac과 분리된 런타임일 수 있으므로, CLI 설치 가능 여부와 auth/profile 존재 여부를 별도로 확인해야 합니다.

## 읽는 순서

1. `SKILL.md`
2. `docs/capability-registry.md`
3. `docs/execution-contract.md`
4. 필요한 `references/*.md`

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

## 읽는 순서

1. `SKILL.md`
2. `docs/capability-registry.md`
3. `docs/execution-contract.md`
4. 필요한 `references/*.md`

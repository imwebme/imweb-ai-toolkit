# imweb AI toolkit foundation

이 문서는 `imweb-ai-toolkit`가 무엇을 책임지고, 무엇을 책임지지 않는지 정리합니다. 핵심은 "toolkit은 실행기를 대체하지 않고, 실행기를 안전하게 연결하는 자산 레이어"이며, install/bootstrap 기본 경로는 public `imweb-cli-release` stable distribution plane입니다.

## foundation 요약

- `imweb-cli`는 실행기입니다.
- `imweb-ai-toolkit`는 실행기를 여러 AI 표면에 연결하는 toolkit 자산을 제공합니다.
- 공개 skill bundle entrypoint는 `skills/imweb/SKILL.md` 하나입니다.
- 표면 차이는 루트 `plugin.json`과 각 surface metadata에서 흡수합니다.
- 설치 후 standalone으로 읽힐 최소 문서는 `skills/imweb/docs/`에 둡니다.

## 왜 toolkit을 분리하나

toolkit을 CLI 내부 기능이 아닌 별도 자산 레이어로 두는 이유는 단순합니다.

- CLI는 특정 에이전트 런타임에 종속되지 않는 실행기여야 합니다.
- skill, playbook, 표면 메타데이터는 바이너리보다 더 자주 바뀔 수 있습니다.
- Codex, Claude, Cursor가 같은 실행기를 공유하더라도, discovery 방식과 온보딩 문서는 서로 다를 수 있습니다.
- 문서와 reference를 분리해 두면 설치 후에도 런타임 바깥에서 검토와 유지보수가 쉽습니다.

## 책임 경계

### `imweb-cli`가 책임지는 것

- 명령 실행
- 인증과 profile 선택
- `--output json`, `--dry-run`, `--yes` 같은 실행 계약
- 에러 포맷과 종료 코드
- 설치 대상 바이너리와 release payload의 source of truth

### `imweb-ai-toolkit`가 책임지는 것

- 공개 skill `imweb`
- 표면별 plugin metadata
- 설치, 업데이트, bootstrap 스크립트
- `install-cli` 기본값이 읽는 public stable distribution pointer
- foundation, integration, support matrix, playbook 문서
- bundle-local docs와 도메인별 references

### toolkit이 책임지지 않는 것

- CLI 바이너리의 기능 추가나 동작 변경
- 공개되지 않은 명령/옵션 가정
- 자체 MCP 서버 제공
- 제한적 지원 표면에 대한 완전 자동 설치

## 현재 public-safe 구조

```text
imweb-ai-toolkit/
├─ plugin.json
├─ package.json
├─ README.md
├─ .codex-plugin/
│  ├─ README.md
│  └─ plugin.json
├─ .claude-plugin/
│  ├─ README.md
│  ├─ manifest.json
│  ├─ marketplace.json
│  └─ plugin.json
├─ .cursor-plugin/
│  ├─ README.md
│  ├─ marketplace.json
│  └─ plugin.json
├─ .mcp.json
├─ assets/
│  └─ README.md
├─ docs/
│  ├─ cli-toolkit-integration.md
│  ├─ imweb-ai-toolkit.md
│  ├─ skill-installation-and-usage.md
│  └─ surface-support-matrix.md
├─ examples/
│  ├─ README.md
│  └─ price-reaction/
├─ install/
│  ├─ README.md
│  ├─ bootstrap-imweb.ps1
│  ├─ bootstrap-imweb.sh
│  ├─ install-cli.ps1
│  ├─ install-cli.sh
│  ├─ install-skills.ps1
│  └─ install-skills.sh
└─ skills/
   └─ imweb/
      ├─ README.md
      ├─ SKILL.md
      ├─ docs/
      │  ├─ README.md
      │  ├─ capability-registry.md
      │  ├─ commands.md
      │  ├─ execution-contract.md
      │  ├─ imweb-ai-toolkit.md
      │  └─ scenario-playbooks.md
      └─ references/
         ├─ README.md
         ├─ community.md
         ├─ member.md
         ├─ order.md
         ├─ payment.md
         ├─ product.md
         ├─ promotion.md
         ├─ routing.md
         ├─ script.md
         └─ site.md
```

## 핵심 자산 설명

### 루트 메타

- `plugin.json`
  - 레포 전체의 canonical root entrypoint입니다.
  - Codex, Claude, Cursor, MCP 관련 하위 entrypoint를 한곳에서 정리합니다.
- `package.json`
  - toolkit 식별자와 메타 패키지 정보를 유지합니다.
- `.mcp.json`
  - 이 레포가 자체 MCP 서버를 번들하지 않는다는 현재 범위를 설명합니다.

### 표면 메타

- `.codex-plugin/`
  - Codex CLI와 Codex App용 메타데이터와 시작 문서를 둡니다.
- `.claude-plugin/`
  - Claude Code와 Claude Desktop용 기본 메타데이터를 둡니다.
  - `marketplace.json`과 compatibility `manifest.json`을 함께 유지합니다.
- `.cursor-plugin/`
  - Cursor 수동 연결 메타데이터와 marketplace 메타를 둡니다.

### 공개 skill과 bundle 문서

- `skills/imweb/SKILL.md`
  - 공개 skill bundle의 entrypoint입니다.
- `skills/imweb/docs/`
  - 설치 후에도 바로 읽을 수 있는 최소 문서 세트입니다.
- `skills/imweb/references/`
  - 주문, 결제, 상품, 사이트 등 도메인별 실행 지식을 둡니다.

### 저장소 문서와 공개 자산

- `docs/`
  - public-safe foundation, integration, installation, support matrix 문서를 둡니다.
- `install/`
  - CLI 설치기, skill 설치기, bootstrap 진입점을 둡니다.
- `examples/`
  - 샘플 시나리오와 fixture를 둡니다.

## 읽는 순서

1. [../README.md](../README.md)
2. [./cli-toolkit-integration.md](./cli-toolkit-integration.md)
3. [./skill-installation-and-usage.md](./skill-installation-and-usage.md)
4. [./surface-support-matrix.md](./surface-support-matrix.md)
5. [../skills/imweb/SKILL.md](../skills/imweb/SKILL.md)
6. 필요 시 [../skills/imweb/docs/execution-contract.md](../skills/imweb/docs/execution-contract.md), [../skills/imweb/docs/capability-registry.md](../skills/imweb/docs/capability-registry.md), [../skills/imweb/docs/scenario-playbooks.md](../skills/imweb/docs/scenario-playbooks.md)

## 공개 skill과 reference의 관계

- 사용자나 에이전트는 공개 skill `imweb` 하나를 진입점으로 사용합니다.
- `imweb` skill은 전역 탐색과 도메인 라우팅을 담당합니다.
- 세부 작업 절차는 `skills/imweb/references/`의 domain reference가 이어받습니다.
- 저장소 루트 문서는 repo overview 기준이고, `skills/imweb/docs/`는 설치 후 bundle 기준입니다.

즉, root `docs/`는 public repo overview를 위한 문서이고, `skills/imweb/docs/`는 설치된 skill bundle 소비자를 위한 최소 문서입니다.

## 실행 계약과 capability truth

toolkit은 CLI 실행 계약을 재정의하지 않습니다. 대신 아래 문서를 통해 CLI truth를 읽는 순서를 고정합니다.

- 실행 계약: [../skills/imweb/docs/execution-contract.md](../skills/imweb/docs/execution-contract.md)
- capability registry: [../skills/imweb/docs/capability-registry.md](../skills/imweb/docs/capability-registry.md)
- 명령 해설: [../skills/imweb/docs/commands.md](../skills/imweb/docs/commands.md)
- 시나리오 절차: [../skills/imweb/docs/scenario-playbooks.md](../skills/imweb/docs/scenario-playbooks.md)

## 공개 패키지 정합성

public repo에서 직접 보존하는 것은 설치 경로와 문서 정합성입니다.

- `examples/price-reaction/`
  - 예시 흐름과 fixture를 제공합니다.
- 문서 정합성
  - root README는 public repo entrypoint로 읽혀야 합니다.
  - support matrix, 설치 문서, surface README의 지원 수준 표현이 일치해야 합니다.
  - 공개 문서는 public repo 안에서 닫힌 상대 링크만 사용해야 합니다.

## 갱신 시 주의점

- 표면 메타를 바꾸면 root README와 surface README를 함께 갱신합니다.
- 공개 skill 구조를 바꾸면 root `docs/`와 `skills/imweb/docs/`를 함께 갱신합니다.
- 지원 수준을 바꾸면 support matrix와 각 surface README를 함께 갱신합니다.
- bootstrap 또는 설치기 동작을 바꾸면 설치 문서와 onboarding 문서를 함께 갱신합니다.

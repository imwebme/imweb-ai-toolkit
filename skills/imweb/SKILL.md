---
name: imweb
description: Use when the user needs command discovery or execution guidance for imweb-cli across site, product, order, payment, member, promotion, community, and script domains. Triggers on requests to inspect current config, find the right imweb CLI path, or safely execute a documented imweb-cli flow.
---

# imweb

아임웹 CLI 전역 진입점 skill입니다.

먼저 볼 문서:
- [`docs/capability-registry.md`](./docs/capability-registry.md)
- [`docs/execution-contract.md`](./docs/execution-contract.md)
- [`docs/commands.md`](./docs/commands.md)
- 필요하면 [`docs/imweb-ai-toolkit.md`](./docs/imweb-ai-toolkit.md)

이 skill의 역할:
- 현재 profile, `site_code`, 인증 상태와 지원 커맨드 범위를 먼저 확인합니다.
- 요청을 정확한 도메인으로 라우팅하고, 상세 절차는 내부 reference에서만 이어서 확인합니다.
- 공개 호출 표면은 이 `imweb` 하나만 사용합니다.

기본 시작점:
1. `imweb --output json config context`
2. `imweb --output json config command-capabilities`
3. 필요한 경우 `imweb --output json config command-capabilities --domain <domain>`
4. exact 확인이 필요하면 `imweb --output json config command-capabilities --path "<exact path>"`
5. 필요한 하위 명령만 `--help`

도메인 라우팅:
- 주문, 취소, 반품, 교환, 송장, 배송: [`references/order.md`](./references/order.md)
- 무통장 입금 확인: [`references/payment.md`](./references/payment.md)
- 상품, 카테고리, 재고, 옵션, 이미지: [`references/product.md`](./references/product.md)
- 회원 조회, 등급, 그룹, 카트, 위시리스트: [`references/member.md`](./references/member.md)
- 쿠폰, 포인트: [`references/promotion.md`](./references/promotion.md)
- Q&A, 리뷰, 리뷰 답변: [`references/community.md`](./references/community.md)
- 사이트 정보, 유닛, integration: [`references/site.md`](./references/site.md)
- 스크립트 조회/변경: [`references/script.md`](./references/script.md)
- 전역 탐색 규칙과 공개/내부 경계: [`references/routing.md`](./references/routing.md)

실행 원칙:
- 커맨드군을 문서에 복제하지 말고 registry의 `domain`, `surface`, `public_leaf_paths`를 먼저 봅니다.
- write 전에는 가능한 read로 현재 상태와 대상 식별자를 먼저 확인합니다.
- write는 항상 `--dry-run`으로 요청 형태를 먼저 확인합니다.
- 대상, 입력 JSON, 변경 의도가 확정된 뒤에만 `--yes`를 사용합니다.
- 문서와 `--help`에 없는 workflow, 숨은 파라미터, 관리자 UI 절차는 추정하지 않습니다.
- 단일 관찰이나 단일 live 검증 사례를 모든 환경의 일반 규칙처럼 확장하지 않습니다.
- 실패 사례와 성공 사례의 차이가 보여도, 그 한 건만으로 실패 원인을 단정하지 않습니다.

이 skill은 공개 진입점만 제공합니다. 세부 도메인 playbook은 모두 `references/` 아래 내부 자산으로 유지합니다.

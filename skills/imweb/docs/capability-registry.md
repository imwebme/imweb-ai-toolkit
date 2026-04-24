# capability registry

이 문서는 설치된 `imweb` bundle 안에서 command truth를 읽는 최소 기준입니다.

## 먼저 확인할 명령

1. `imweb --output json config context`
2. `imweb --output json config command-capabilities`

## 읽는 순서

1. `config context`로 현재 profile, `site_code`, 인증 상태, readiness를 확인합니다.
2. `config command-capabilities`로 지원 domain/path를 좁힙니다.
3. 필요한 leaf path의 `--help`를 다시 확인합니다.

## 핵심 해석 원칙

- `domain`은 공개 skill 분리 축이 아니라 내부 reference 라우팅 축입니다.
- `surface=group`이면 `public_leaf_paths`를 따라 실제 leaf를 다시 확인합니다.
- `risk_level`, `recommended_read_paths`, `preferred_input_modes`, `input_contract`를 우선 읽습니다.

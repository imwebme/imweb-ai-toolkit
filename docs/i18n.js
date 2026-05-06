/* imweb-ai-toolkit — i18n strings for EN / KO / JA / ZH */
(function () {
  const I18N = {
    en: {
      meta: {
        title: "imweb-ai-toolkit — AI agents for imweb store operations",
        description: "Connect Claude, Codex, and other AI agents to the official imweb CLI. Inspect orders, products, reviews, and members through natural-language requests."
      },
      nav: {
        install: "Install",
        surfaces: "Surfaces",
        usecases: "Use cases",
        trust: "Trust",
        docs: "Docs",
        github: "GitHub",
        installCta: "Install →"
      },
      hero: {
        eyebrow: "Open-source toolkit · Apache-2.0",
        h1a: "AI agents for",
        h1b: "imweb store operations.",
        lede: "Connect Claude, Codex, and other AI agents to the official imweb CLI. Ask in plain language — your agent inspects orders, products, reviews, members, promotions, and site data on your behalf.",
        ctaPrimary: "Full install guide",
        quickLabel: "Paste into your AI agent",
        quickCode: "Install imweb-ai-toolkit from github.com/imwebme/imweb-ai-toolkit",
        copy: "Copy",
        ctaSecondary: "See it work →",
        b1: "No commands to memorize — just describe what you want.",
        b2: "Runs locally; uses your existing imweb login.",
        b3: "Read-only inspection of data available through the CLI.",
        agentsLabel: "Works with the agents your team already uses",
        termTitle: "claude · imweb-ai-toolkit",
        termStatus: "connected",
        termHint: "Natural language → official imweb CLI"
      },
      flow: {
        num: "§ 01",
        h2: "How a request travels",
        sub: "The toolkit sits between your AI agent and the official imweb CLI. It does not replace the CLI, host your data, or call write actions on its own.",
        s1: { label: "You ask", desc: "“Check today’s suspicious orders.”" },
        s2: { label: "Your AI agent", desc: "Claude, Codex, or another supported surface." },
        s3: { label: "imweb-ai-toolkit", desc: "Plugin metadata, skills, local MCP bridge." },
        s4: { label: "Official imweb CLI", desc: "Local install · reuses your imweb auth." },
        s5: { label: "Store data", desc: "Orders · products · reviews · members." }
      },
      install: {
        num: "§ 02 / INSTALL",
        h2: "One sentence. Any AI agent.",
        sub: "No commands to memorize. Paste the GitHub URL into your AI agent and ask it to install — that's it.",
        s1: { t: "Paste this into your AI agent.", d: "Claude Code, Codex, Claude Desktop — whichever your team runs. The toolkit detects the surface and installs itself.", copy: "github.com/imwebme/imweb-ai-toolkit — install this for me", after: "Then ask in plain language — “check recent orders”, “review product details”, etc." },
        s2: { t: "Give it the repo URL.", d: "Copy the link below. The agent reads the README and figures out the right install path." },
        s3: { t: "Ask, in plain language.", d: "No flags, no agent-specific syntax. The toolkit detects which surface you're on and installs itself.", q: "Look at the imweb-ai-toolkit repo on GitHub and install it for me. I want to ask about my store." },
        asideH: "Supported out of the box",
        asideManual: "(manual)",
        asideLink: "See the full support matrix →",
        recommended: "Recommended",
        statusSupported: "Supported",
        statusManual: "Manual",
        cards: {
          claudeCode: { title: "Claude Code", desc: "Adds imweb skills and the local CLI bridge to your Claude Code workspace." },
          codex: { title: "Codex (CLI / App)", desc: "Registers the toolkit as a plugin available to Codex sessions." },
          mcp: { title: "Claude Desktop · Local MCP", desc: "Wires the local MCP bridge so Claude Desktop can call the imweb CLI on your machine." },
          cowork: { title: "Claude Desktop · Cowork", desc: "Installs the Cowork-flavored skills bundle for desktop collaboration." },
          skills: { title: "Agent Skills (fallback)", desc: "Generic fallback that exposes the toolkit through the Agent Skills CLI." },
          cursor: { title: "Cursor", desc: "Cursor workspaces are supported through manual configuration. See the docs." }
        },
        foot: {
          a: { t: "Prerequisite", b: "Node 18+ and an imweb account with CLI access." },
          b: { t: "What it does", b: "The agent installs / updates the official <code>imweb</code> CLI locally and reuses your existing auth." },
          c: { t: "Then ask", b: "Open the agent and try: <em>“List recent orders.”</em>" }
        }
      },
      surfaces: {
        num: "§ 03 / SURFACES",
        h2: "Surface support matrix.",
        sub: "A precise picture of where the toolkit is fully supported, partially supported, or out of scope.",
        col: { surface: "Surface", install: "Install", skills: "Skills", bridge: "Local CLI bridge", status: "Status" },
        legend: { yes: "First-class", mid: "Partial / manual", no: "Not yet" },
        rows: {
          cc: "Claude Code",
          codex: "Codex CLI / App",
          skills: "Agent Skills CLI",
          mcp: "Claude Desktop · Local MCP",
          cowork: "Claude Desktop · Cowork",
          cursor: "Cursor workspace"
        },
        pillGo: "Supported",
        pillWarn: "Manual"
      },
      usecases: {
        num: "§ 04 / USE CASES",
        h2: "Ask the way you actually think.",
        sub: "Real prompts from store operations work. Each one runs through data and commands available through the official imweb CLI — no custom queries, no hosted middleman.",
        agentTag: "agent",
        cliTag: "cli",
        cards: [
          { tag: "Orders · review", prompt: "Use imweb tool to investigate suspicious recent orders.", agent: "Checks recent order data available through the CLI and highlights unusual payment, cancellation, or status signals.", cli: "<code>imweb order list</code> · <code>imweb order get {orderNo}</code>" },
          { tag: "Orders · signals", prompt: "Check recent orders for unusual payment or cancellation signals.", agent: "Looks across recent orders and returns a short operator summary with order numbers to inspect next.", cli: "<code>imweb order list</code>" },
          { tag: "Products · reviews", prompt: "Review product details and recent reviews.", agent: "Reads available product and review data, then summarizes what an operator should look at.", cli: "<code>imweb product list</code> · <code>imweb community review list</code>" },
          { tag: "Store data", prompt: "Inspect available store data through the imweb CLI.", agent: "Uses the toolkit guide to choose the relevant read command for orders, products, reviews, members, promotions, or site data.", cli: "<code>imweb --help</code> · supported list/detail commands" }
        ],
        wide: {
          tag: "Example flow · store operations",
          prompt: "What should I check before the morning order review?",
          agent: "Reads available order, product, and review data through the CLI and returns a focused checklist for the operator.",
          cli: "<code>imweb order list</code> · <code>imweb product list</code> · <code>imweb community review list</code>",
          note: "Read-only inspection. The toolkit does not change prices, fulfill orders, or modify your store."
        }
      },
      trust: {
        num: "§ 05 / TRUST & BOUNDARIES",
        h2: "What the toolkit will and won’t do.",
        sub: "Boundaries are part of the product. Nothing here is a hosted service.",
        will: "Will",
        wont: "Won’t",
        will_items: [
          "Connect AI agents to the <strong>official imweb CLI</strong>.",
          "Install / update the CLI <strong>locally</strong> on your machine.",
          "Reuse your <strong>existing imweb auth</strong>; prompt browser login when needed.",
          "Ship plugin metadata, skill assets, install scripts, docs, and examples.",
          "Provide a local MCP bridge for Claude Desktop flows."
        ],
        wont_items: [
          "Host your store data or proxy it through a cloud service.",
          "Run automatic <strong>write actions</strong> against your store.",
          "Promise traffic ranks, hidden metrics, or analytics the CLI doesn’t expose.",
          "Replace the official imweb CLI — it sits next to it.",
          "Ship telemetry or tracking from this site."
        ],
        foot: {
          license: { l: "License", v: "Apache-2.0 · toolkit assets" },
          tm: { l: "Trademarks", v: '<a href="#docs">TRADEMARKS.md →</a>' },
          dist: { l: "Distribution", v: "Public repo · GitHub Pages" },
          run: { l: "Runtime", v: "Local on your machine" }
        }
      },
      docs: {
        num: "§ 06 / DOCS",
        h2: "Read before you ship.",
        sub: "The four guides most teams open in their first week, plus the project README.",
        items: [
          { n: "01", t: "AI agent installation", d: "Step-by-step install for each supported surface." },
          { n: "02", t: "Skill installation & usage", d: "How agent skills wrap the imweb CLI commands." },
          { n: "03", t: "CLI · toolkit integration", d: "How the toolkit calls the official imweb CLI locally." },
          { n: "04", t: "Surface support matrix", d: "Authoritative list of supported and manual surfaces." },
          { n: "R", t: "README.md", d: "Project overview, scope, and contribution notes." }
        ]
      },
      endcta: {
        num: "§ 07 / GET STARTED",
        h2: "Stop clicking through the admin for the same five questions.",
        sub: "Install the toolkit, point your AI agent at it, and ask in plain language. The CLI does the rest.",
        primary: "Install the toolkit",
        secondary: "View on GitHub →"
      },
      foot: {
        meta1: "Apache-2.0",
        meta2: "Open-source toolkit",
        meta3: "Open-source toolkit for imweb CLI workflows",
        promo: {
          eyebrow: "Don't have an imweb site yet?",
          title: "Build your site on imweb first, then connect this toolkit.",
          cta: "imweb.me"
        }
      },
      term: {
        you: "you",
        l1: "Use imweb tool to investigate suspicious recent orders.",
        c1: "// agent calls the official imweb CLI locally",
        cli1: "imweb order list --output json",
        meta1: "fetched recent orders · local CLI",
        flag1: "multi-fail-then-paid",
        flag2: "cancelled quickly",
        result1: "I found a few orders worth checking: one repeated payment attempt that later succeeded, and one quick cancellation. Want me to open the order details next?",
        l2: "Yes — review the flagged order details.",
        c2: "// agent asks the CLI for selected order details",
        cli2: "imweb order get {orderNo} --output json"
      }
    },

    ko: {
      meta: {
        title: "imweb-ai-toolkit — 아임웹 쇼핑몰 운영을 위한 AI 에이전트",
        description: "Claude, Codex 같은 AI 에이전트를 공식 imweb CLI에 연결하세요. 자연어 한 줄로 주문, 상품, 리뷰, 회원 데이터를 확인합니다."
      },
      nav: {
        install: "설치",
        surfaces: "지원 환경",
        usecases: "사용 예시",
        trust: "신뢰",
        docs: "문서",
        github: "GitHub",
        installCta: "설치하기 →"
      },
      hero: {
        eyebrow: "오픈소스 툴킷 · Apache-2.0",
        h1a: "쇼핑몰 운영을 맡길",
        h1b: "AI 에이전트의 시작.",
        lede: "Claude, Codex 등 AI 에이전트를 공식 imweb CLI에 연결합니다. 평소 말투 그대로 요청하면 — 에이전트가 주문, 상품, 리뷰, 회원, 프로모션, 사이트 데이터를 대신 확인해 드립니다.",
        ctaPrimary: "설치 가이드 전체 보기",
        quickLabel: "AI 에이전트에 붙여넣기",
        quickCode: "github.com/imwebme/imweb-ai-toolkit 보고 설치해줘",
        copy: "복사",
        ctaSecondary: "동작 살펴보기 →",
        b1: "명령어를 외울 필요 없이, 원하는 걸 그대로 말하세요.",
        b2: "내 컴퓨터에서 동작하고, 기존 imweb 로그인을 그대로 사용합니다.",
        b3: "CLI가 제공하는 데이터를 읽기 전용으로 확인합니다.",
        agentsLabel: "팀이 이미 쓰는 에이전트와 바로 연결됩니다",
        termTitle: "claude · imweb-ai-toolkit",
        termStatus: "연결됨",
        termHint: "자연어 → 공식 imweb CLI"
      },
      flow: {
        num: "§ 01",
        h2: "요청이 흐르는 경로",
        sub: "툴킷은 AI 에이전트와 공식 imweb CLI 사이에서만 동작합니다. CLI를 대체하거나, 데이터를 호스팅하거나, 마음대로 변경 작업을 실행하지 않습니다.",
        s1: { label: "사용자 요청", desc: "“오늘 의심 주문 확인해줘.”" },
        s2: { label: "AI 에이전트", desc: "Claude, Codex 또는 지원 환경." },
        s3: { label: "imweb-ai-toolkit", desc: "플러그인, 스킬, 로컬 MCP 브리지." },
        s4: { label: "공식 imweb CLI", desc: "로컬 설치 · 기존 인증 재사용." },
        s5: { label: "쇼핑몰 데이터", desc: "주문 · 상품 · 리뷰 · 회원." }
      },
      install: {
        num: "§ 02 / 설치",
        h2: "한 마디면 됩니다. 어떤 AI 에이전트든.",
        sub: "외울 명령어 없습니다. 사용 중인 AI 에이전트에 GitHub URL을 붙여넣고 \"설치해줘\"라고 말하면 끝.",
        s1: { t: "AI 에이전트에 이 한 줄을 붙여넣으세요.", d: "Claude Code, Codex, Claude Desktop — 팀이 쓰는 어디든 됩니다. 툴킷이 환경을 알아서 감지해 설치합니다.", copy: "github.com/imwebme/imweb-ai-toolkit 보고 설치해줘", after: "설치 후엔 평소 말투 그대로 — “최근 주문 확인해줘”, “상품 상세와 리뷰 살펴봐줘” 처럼 물어보면 됩니다." },
        s2: { t: "레포 URL을 알려주세요.", d: "아래 링크를 복사해서 붙여 넣으세요. 에이전트가 README를 읽고 알맞은 설치 경로를 스스로 찾아갑니다." },
        s3: { t: "평소 말투로 부탁하세요.", d: "옵션도, 에이전트별 문법도 없습니다. 툴킷이 환경을 감지해 알아서 설치됩니다.", q: "GitHub의 imweb-ai-toolkit 레포 보고 설치해줘. 우리 쇼핑몰 데이터 좀 물어볼 거야." },
        asideH: "기본 지원 환경",
        asideManual: "(수동)",
        asideLink: "전체 지원 매트릭스 보기 →",
        recommended: "추천",
        statusSupported: "지원",
        statusManual: "수동 설정",
        cards: {
          claudeCode: { title: "Claude Code", desc: "Claude Code 워크스페이스에 imweb 스킬과 로컬 CLI 브리지를 추가합니다." },
          codex: { title: "Codex (CLI / 앱)", desc: "Codex 세션에서 사용할 수 있는 플러그인으로 등록합니다." },
          mcp: { title: "Claude Desktop · 로컬 MCP", desc: "Claude Desktop이 로컬에서 imweb CLI를 호출할 수 있도록 MCP 브리지를 연결합니다." },
          cowork: { title: "Claude Desktop · Cowork", desc: "Cowork 환경용 스킬 번들을 설치합니다." },
          skills: { title: "Agent Skills (대체)", desc: "Agent Skills CLI를 통해 툴킷을 노출하는 범용 fallback입니다." },
          cursor: { title: "Cursor", desc: "Cursor 워크스페이스는 수동 설정으로 지원됩니다. 문서를 참고하세요." }
        },
        foot: {
          a: { t: "사전 준비", b: "Node 18+ 와 imweb CLI 사용이 가능한 imweb 계정이 필요합니다." },
          b: { t: "어떻게 동작하나요", b: "에이전트가 공식 <code>imweb</code> CLI를 로컬에 설치/업데이트하고, 기존 인증을 재사용합니다." },
          c: { t: "이렇게 물어보세요", b: "에이전트를 열고 <em>“최근 주문 목록 보여줘.”</em> 라고만 하면 됩니다." }
        }
      },
      surfaces: {
        num: "§ 03 / 지원 환경",
        h2: "지원 환경 매트릭스.",
        sub: "어디까지 정식 지원이고, 어디부터 수동 설정인지 한눈에 보여드립니다.",
        col: { surface: "환경", install: "설치", skills: "스킬", bridge: "로컬 CLI 브리지", status: "상태" },
        legend: { yes: "정식 지원", mid: "부분 / 수동", no: "미지원" },
        rows: {
          cc: "Claude Code",
          codex: "Codex CLI / 앱",
          skills: "Agent Skills CLI",
          mcp: "Claude Desktop · 로컬 MCP",
          cowork: "Claude Desktop · Cowork",
          cursor: "Cursor 워크스페이스"
        },
        pillGo: "지원",
        pillWarn: "수동"
      },
      usecases: {
        num: "§ 04 / 사용 예시",
        h2: "평소 말하는 그대로 요청하세요.",
        sub: "실제 운영 업무에서 자주 쓰는 요청들입니다. 모두 공식 imweb CLI에서 제공되는 데이터와 명령 범위 안에서 실행됩니다 — 별도 쿼리도, 호스팅 중개자도 없습니다.",
        agentTag: "에이전트",
        cliTag: "cli",
        cards: [
          { tag: "주문 · 검토", prompt: "Use imweb tool to investigate suspicious recent orders.", agent: "CLI에서 확인 가능한 최근 주문 데이터를 살펴보고 결제, 취소, 상태 흐름에서 눈에 띄는 신호를 정리합니다.", cli: "<code>imweb order list</code> · <code>imweb order get {orderNo}</code>" },
          { tag: "주문 · 신호", prompt: "Check recent orders for unusual payment or cancellation signals.", agent: "최근 주문을 훑어보고 다음에 확인할 주문 번호와 짧은 운영 요약을 돌려줍니다.", cli: "<code>imweb order list</code>" },
          { tag: "상품/리뷰", prompt: "Review product details and recent reviews.", agent: "상품과 리뷰 데이터 중 CLI에서 가능한 범위를 읽고 운영자가 볼 만한 내용을 요약합니다.", cli: "<code>imweb product list</code> · <code>imweb community review list</code>" },
          { tag: "스토어 데이터", prompt: "Inspect available store data through the imweb CLI.", agent: "주문, 상품, 리뷰, 회원, 프로모션, 사이트 데이터 중 요청에 맞는 읽기 명령을 고릅니다.", cli: "<code>imweb --help</code> · 지원되는 list/detail 명령" }
        ],
        wide: {
          tag: "예시 흐름 · 쇼핑몰 운영",
          prompt: "아침 주문 검토 전에 무엇을 확인하면 좋을까?",
          agent: "CLI에서 가능한 주문, 상품, 리뷰 데이터를 읽고 운영자가 바로 볼 수 있는 체크리스트로 정리합니다.",
          cli: "<code>imweb order list</code> · <code>imweb product list</code> · <code>imweb community review list</code>",
          note: "읽기 전용 확인 작업입니다. 툴킷은 가격을 바꾸거나 주문을 처리하거나 쇼핑몰을 수정하지 않습니다."
        }
      },
      trust: {
        num: "§ 05 / 신뢰와 경계",
        h2: "이 툴킷이 하는 일과 하지 않는 일.",
        sub: "경계는 제품의 일부입니다. 이 툴킷은 호스팅 서비스가 아닙니다.",
        will: "한다",
        wont: "하지 않는다",
        will_items: [
          "AI 에이전트를 <strong>공식 imweb CLI</strong>에 연결합니다.",
          "CLI를 <strong>로컬에서</strong> 설치/업데이트합니다.",
          "<strong>기존 imweb 인증</strong>을 재사용하며, 필요할 때 브라우저 로그인을 요청합니다.",
          "플러그인 메타데이터, 스킬 자산, 설치 스크립트, 문서, 예시를 제공합니다.",
          "Claude Desktop 흐름을 위한 로컬 MCP 브리지를 제공합니다."
        ],
        wont_items: [
          "데이터를 호스팅하거나 클라우드 서비스로 중계하지 않습니다.",
          "쇼핑몰에 자동으로 <strong>변경 작업</strong>을 실행하지 않습니다.",
          "CLI가 제공하지 않는 트래픽 순위나 비공개 지표를 약속하지 않습니다.",
          "공식 imweb CLI를 대체하지 않습니다 — 옆에서 함께 동작합니다.",
          "이 사이트에서 텔레메트리나 추적 스크립트를 보내지 않습니다."
        ],
        foot: {
          license: { l: "라이선스", v: "Apache-2.0 · 툴킷 자산" },
          tm: { l: "상표", v: '<a href="#docs">TRADEMARKS.md →</a>' },
          dist: { l: "배포", v: "공개 레포 · GitHub Pages" },
          run: { l: "실행 위치", v: "내 컴퓨터에서 로컬 실행" }
        }
      },
      docs: {
        num: "§ 06 / 문서",
        h2: "사용 전에 한번 읽어보세요.",
        sub: "대부분의 팀이 첫 주에 여는 4개의 가이드와 README입니다.",
        items: [
          { n: "01", t: "AI 에이전트 설치", d: "지원 환경별 단계별 설치 가이드." },
          { n: "02", t: "스킬 설치 및 사용", d: "스킬이 imweb CLI 명령을 어떻게 감싸는지 설명." },
          { n: "03", t: "CLI · 툴킷 연동", d: "툴킷이 로컬에서 공식 imweb CLI를 호출하는 방식." },
          { n: "04", t: "지원 환경 매트릭스", d: "정식 지원과 수동 지원 환경의 공식 목록." },
          { n: "R", t: "README.md", d: "프로젝트 개요, 범위, 기여 안내." }
        ]
      },
      endcta: {
        num: "§ 07 / 시작하기",
        h2: "매번 같은 질문 때문에 어드민 들락거리지 마세요.",
        sub: "툴킷을 설치하고, AI 에이전트를 연결하고, 평소처럼 물어보세요. 나머지는 CLI가 처리합니다.",
        primary: "툴킷 설치하기",
        secondary: "GitHub에서 보기 →"
      },
      foot: {
        meta1: "Apache-2.0",
        meta2: "오픈소스 툴킷",
        meta3: "imweb CLI 워크플로를 위한 오픈소스 툴킷",
        promo: {
          eyebrow: "아직 imweb 사이트가 없으신가요?",
          title: "먼저 imweb에서 사이트를 만들고, 이 툴킷을 연결하세요.",
          cta: "imweb.me"
        }
      },
      term: {
        you: "나",
        l1: "Use imweb tool to investigate suspicious recent orders.",
        c1: "// 에이전트가 로컬 imweb CLI를 호출",
        cli1: "imweb order list --output json",
        meta1: "최근 주문 조회 · 로컬 CLI",
        flag1: "결제 재시도 후 성공",
        flag2: "빠른 취소",
        result1: "확인이 필요한 주문이 몇 건 있습니다. 반복 결제 시도 후 성공한 주문과 빠르게 취소된 주문이 보여요. 주문 상세를 이어서 열어볼까요?",
        l2: "응 — 표시된 주문 상세를 확인해줘.",
        c2: "// 에이전트가 선택한 주문 상세를 CLI로 조회",
        cli2: "imweb order get {orderNo} --output json"
      }
    },

    ja: {
      meta: {
        title: "imweb-ai-toolkit — imwebストア運用のためのAIエージェント",
        description: "Claude、Codexなどのエージェントを公式imweb CLIに接続。自然言語で注文・商品・レビュー・会員データを確認します。"
      },
      nav: {
        install: "インストール",
        surfaces: "対応環境",
        usecases: "ユースケース",
        trust: "信頼性",
        docs: "ドキュメント",
        github: "GitHub",
        installCta: "インストール →"
      },
      hero: {
        eyebrow: "オープンソース・ツールキット · Apache-2.0",
        h1a: "imweb運用を任せる、",
        h1b: "AIエージェントの起点。",
        lede: "Claude、Codex などの AI エージェントを公式 imweb CLI に接続します。普段どおりの言葉で頼むだけで、エージェントが注文・商品・レビュー・会員・プロモーション・サイトデータを代わりに確認します。",
        ctaPrimary: "インストール手順を見る",
        quickLabel: "AI エージェントに貼り付け",
        quickCode: "github.com/imwebme/imweb-ai-toolkit から imweb-ai-toolkit をインストールして",
        copy: "コピー",
        ctaSecondary: "動作を見る →",
        b1: "コマンドを覚える必要なし。やりたいことを言葉で伝えるだけ。",
        b2: "ローカルで動作し、既存の imweb ログインをそのまま使います。",
        b3: "CLI が提供するデータを読み取り専用で確認します。",
        agentsLabel: "チームがすでに使っているエージェントと連携",
        termTitle: "claude · imweb-ai-toolkit",
        termStatus: "接続済",
        termHint: "自然言語 → 公式 imweb CLI"
      },
      flow: {
        num: "§ 01",
        h2: "リクエストが流れる経路",
        sub: "ツールキットは AI エージェントと公式 imweb CLI の間にだけ介在します。CLI を置き換えたり、データをホストしたり、勝手に書き込み操作を行ったりしません。",
        s1: { label: "あなたの依頼", desc: "「今日の不審な注文を確認して」" },
        s2: { label: "AI エージェント", desc: "Claude、Codex、その他対応環境。" },
        s3: { label: "imweb-ai-toolkit", desc: "プラグイン・スキル・ローカル MCP ブリッジ。" },
        s4: { label: "公式 imweb CLI", desc: "ローカルにインストール · 既存認証を再利用。" },
        s5: { label: "ストアデータ", desc: "注文 · 商品 · レビュー · 会員。" }
      },
      install: {
        num: "§ 02 / インストール",
        h2: "ひと言だけ。どの AI エージェントでも。",
        sub: "覚えるコマンドはありません。使っている AI エージェントに GitHub URL を貼って「インストールして」と頼むだけ。",
        s1: { t: "AI エージェントに、この一行を貼り付け。", d: "Claude Code、Codex、Claude Desktop — チームで使っているものなら何でも。ツールキットが環境を検知して自動でインストールします。", copy: "github.com/imwebme/imweb-ai-toolkit を見てインストールして", after: "インストール後は普段の言葉で — 「最近の注文を確認して」「商品詳細とレビューを見て」など、そのまま聞けます。" },
        s2: { t: "リポジトリ URL を渡す。", d: "下のリンクをコピーして貼り付け。エージェントが README を読み、適切なインストール経路を自分で判断します。" },
        s3: { t: "普段の言葉で頼む。", d: "オプションもエージェント固有の構文もありません。ツールキットが環境を検知して自動でインストールします。", q: "GitHub の imweb-ai-toolkit リポを見てインストールして。うちのストアについて聞きたい。" },
        asideH: "標準対応",
        asideManual: "(手動)",
        asideLink: "対応マトリクス全体を見る →",
        recommended: "推奨",
        statusSupported: "対応",
        statusManual: "手動設定",
        cards: {
          claudeCode: { title: "Claude Code", desc: "Claude Code ワークスペースに imweb スキルとローカル CLI ブリッジを追加。" },
          codex: { title: "Codex (CLI / アプリ)", desc: "Codex セッションで利用できるプラグインとして登録。" },
          mcp: { title: "Claude Desktop · ローカル MCP", desc: "Claude Desktop がローカルで imweb CLI を呼び出せるよう MCP ブリッジを接続。" },
          cowork: { title: "Claude Desktop · Cowork", desc: "Cowork 用のスキルバンドルをインストール。" },
          skills: { title: "Agent Skills (フォールバック)", desc: "Agent Skills CLI 経由でツールキットを公開する汎用フォールバック。" },
          cursor: { title: "Cursor", desc: "Cursor ワークスペースは手動設定で対応。詳細はドキュメント参照。" }
        },
        foot: {
          a: { t: "前提", b: "Node 18+ と CLI が利用できる imweb アカウント。" },
          b: { t: "何をする?", b: "エージェントが公式 <code>imweb</code> CLI をローカルにインストール/更新し、既存認証を再利用します。" },
          c: { t: "それから聞く", b: "エージェントを開いて <em>「最近の注文を一覧して」</em> と頼むだけ。" }
        }
      },
      surfaces: {
        num: "§ 03 / 対応環境",
        h2: "対応マトリクス。",
        sub: "どこまでが正式対応で、どこからが手動設定なのかを正確にお見せします。",
        col: { surface: "環境", install: "インストール", skills: "スキル", bridge: "ローカル CLI ブリッジ", status: "ステータス" },
        legend: { yes: "正式対応", mid: "部分 / 手動", no: "未対応" },
        rows: {
          cc: "Claude Code",
          codex: "Codex CLI / アプリ",
          skills: "Agent Skills CLI",
          mcp: "Claude Desktop · ローカル MCP",
          cowork: "Claude Desktop · Cowork",
          cursor: "Cursor ワークスペース"
        },
        pillGo: "対応",
        pillWarn: "手動"
      },
      usecases: {
        num: "§ 04 / ユースケース",
        h2: "普段の言葉で頼んでください。",
        sub: "実際の運用業務で頻出するリクエストです。すべて公式 imweb CLI で利用できるデータとコマンドの範囲で実行されます — 独自クエリもホスト中継もありません。",
        agentTag: "エージェント",
        cliTag: "cli",
        cards: [
          { tag: "注文 · 確認", prompt: "Use imweb tool to investigate suspicious recent orders.", agent: "CLI で取得できる最近の注文データを確認し、決済・キャンセル・ステータスの気になる兆候をまとめます。", cli: "<code>imweb order list</code> · <code>imweb order get {orderNo}</code>" },
          { tag: "注文 · シグナル", prompt: "Check recent orders for unusual payment or cancellation signals.", agent: "最近の注文を確認し、次に見るべき注文番号と短い運用サマリを返します。", cli: "<code>imweb order list</code>" },
          { tag: "商品/レビュー", prompt: "Review product details and recent reviews.", agent: "CLI で利用できる商品・レビュー情報を読み、運用担当者が見るべき点を要約します。", cli: "<code>imweb product list</code> · <code>imweb community review list</code>" },
          { tag: "ストアデータ", prompt: "Inspect available store data through the imweb CLI.", agent: "注文、商品、レビュー、会員、プロモーション、サイト情報から、依頼に合う読み取りコマンドを選びます。", cli: "<code>imweb --help</code> · 対応 list/detail コマンド" }
        ],
        wide: {
          tag: "サンプルフロー · ストア運用",
          prompt: "朝の注文確認前に何を見るべき?",
          agent: "CLI で利用できる注文、商品、レビュー情報を読み、すぐ確認できるチェックリストにまとめます。",
          cli: "<code>imweb order list</code> · <code>imweb product list</code> · <code>imweb community review list</code>",
          note: "読み取り専用の確認です。ツールキットは価格変更や注文処理、ストアの編集を行いません。"
        }
      },
      trust: {
        num: "§ 05 / 信頼と境界",
        h2: "ツールキットがすること、しないこと。",
        sub: "境界線は製品の一部です。これはホスティング型サービスではありません。",
        will: "する",
        wont: "しない",
        will_items: [
          "AI エージェントを <strong>公式 imweb CLI</strong> に接続します。",
          "CLI を <strong>ローカル</strong> にインストール / 更新します。",
          "<strong>既存の imweb 認証</strong> を再利用し、必要に応じてブラウザログインを促します。",
          "プラグインメタデータ、スキルアセット、インストールスクリプト、ドキュメント、サンプルを提供します。",
          "Claude Desktop 用のローカル MCP ブリッジを提供します。"
        ],
        wont_items: [
          "ストアデータをホストしたりクラウドに中継したりしません。",
          "ストアに対して自動の <strong>書き込み操作</strong> を実行しません。",
          "CLI が提供しないトラフィック順位や非公開指標を約束しません。",
          "公式 imweb CLI を置き換えません — 並んで動きます。",
          "本サイトからテレメトリやトラッキングを送信しません。"
        ],
        foot: {
          license: { l: "ライセンス", v: "Apache-2.0 · ツールキット資産" },
          tm: { l: "商標", v: '<a href="#docs">TRADEMARKS.md →</a>' },
          dist: { l: "配布", v: "公開リポジトリ · GitHub Pages" },
          run: { l: "実行場所", v: "あなたのマシンでローカル実行" }
        }
      },
      docs: {
        num: "§ 06 / ドキュメント",
        h2: "始める前にひと読み。",
        sub: "多くのチームが最初の一週間で開く 4 つのガイドと README。",
        items: [
          { n: "01", t: "AI エージェントのインストール", d: "対応環境ごとのステップバイステップ手順。" },
          { n: "02", t: "スキルのインストールと使い方", d: "スキルが imweb CLI コマンドをどうラップするか。" },
          { n: "03", t: "CLI · ツールキット連携", d: "ツールキットがローカル CLI を呼び出す仕組み。" },
          { n: "04", t: "対応環境マトリクス", d: "正式対応と手動対応の公式リスト。" },
          { n: "R", t: "README.md", d: "プロジェクト概要・スコープ・コントリビューション。" }
        ]
      },
      endcta: {
        num: "§ 07 / はじめる",
        h2: "同じ確認のために管理画面を行き来するのは、もうやめましょう。",
        sub: "ツールキットを入れて、AI エージェントを向けて、普段の言葉で頼む。あとは CLI が処理します。",
        primary: "ツールキットをインストール",
        secondary: "GitHub で見る →"
      },
      foot: {
        meta1: "Apache-2.0",
        meta2: "オープンソース・ツールキット",
        meta3: "imweb CLI ワークフロー向けのオープンソース・ツールキット",
        promo: {
          eyebrow: "imweb サイトをまだお持ちでない?",
          title: "まず imweb でサイトを作成し、このツールキットを接続しましょう。",
          cta: "imweb.me"
        }
      },
      term: {
        you: "あなた",
        l1: "Use imweb tool to investigate suspicious recent orders.",
        c1: "// エージェントがローカルの imweb CLI を呼び出す",
        cli1: "imweb order list --output json",
        meta1: "最近の注文を取得 · ローカル CLI",
        flag1: "複数回失敗後に決済成功",
        flag2: "短時間でキャンセル",
        result1: "確認すべき注文がいくつかあります。複数回の決済失敗後に成功した注文と、短時間でキャンセルされた注文があります。注文詳細を開きますか?",
        l2: "はい — フラグ付き注文の詳細を確認して。",
        c2: "// エージェントが選択した注文詳細を CLI で取得",
        cli2: "imweb order get {orderNo} --output json"
      }
    },

    zh: {
      meta: {
        title: "imweb-ai-toolkit — 面向 imweb 店铺运营的 AI 代理",
        description: "把 Claude、Codex 等 AI 代理接入官方 imweb CLI。用自然语言查看订单、商品、评价与会员数据。"
      },
      nav: {
        install: "安装",
        surfaces: "支持环境",
        usecases: "使用场景",
        trust: "可信",
        docs: "文档",
        github: "GitHub",
        installCta: "安装 →"
      },
      hero: {
        eyebrow: "开源工具包 · Apache-2.0",
        h1a: "为 imweb 店铺运营",
        h1b: "接上 AI 代理。",
        lede: "把 Claude、Codex 等 AI 代理接入官方 imweb CLI。用日常语言提问 — 代理会替你查看订单、商品、评价、会员、促销与站点数据。",
        ctaPrimary: "查看安装指南",
        quickLabel: "粘贴到 AI 代理",
        quickCode: "从 github.com/imwebme/imweb-ai-toolkit 安装 imweb-ai-toolkit",
        copy: "复制",
        ctaSecondary: "查看运行 →",
        b1: "无需记命令,直接说出你想做的事。",
        b2: "在你本地运行,沿用现有 imweb 登录。",
        b3: "只读访问 CLI 提供的数据。",
        agentsLabel: "与团队已用的代理无缝衔接",
        termTitle: "claude · imweb-ai-toolkit",
        termStatus: "已连接",
        termHint: "自然语言 → 官方 imweb CLI"
      },
      flow: {
        num: "§ 01",
        h2: "一次请求的完整路径",
        sub: "工具包只位于 AI 代理与官方 imweb CLI 之间,不替代 CLI、不托管数据、也不会自行执行写入操作。",
        s1: { label: "你提出请求", desc: "「看下今天可疑订单。」" },
        s2: { label: "AI 代理", desc: "Claude、Codex 或其他支持的环境。" },
        s3: { label: "imweb-ai-toolkit", desc: "插件、技能、本地 MCP 桥。" },
        s4: { label: "官方 imweb CLI", desc: "本地安装 · 复用现有认证。" },
        s5: { label: "店铺数据", desc: "订单 · 商品 · 评价 · 会员。" }
      },
      install: {
        num: "§ 02 / 安装",
        h2: "一句话。任何 AI 代理。",
        sub: "无需记命令。把 GitHub 链接发给你正在用的 AI 代理,让它「安装」就行。",
        s1: { t: "把这一行粘贴给你的 AI 代理。", d: "Claude Code、Codex、Claude Desktop —— 团队在用的都行。工具包会自动识别环境并完成安装。", copy: "看 github.com/imwebme/imweb-ai-toolkit 帮我装一下", after: "装好后直接用日常语言问 —— 「查看最近订单」「看看商品详情和评价」都行。" },
        s2: { t: "把仓库 URL 给它。", d: "复制下面的链接发给它。代理会读 README,自己找到合适的安装路径。" },
        s3: { t: "用大白话告诉它。", d: "无需参数,无需代理特定语法。工具包会识别当前环境并自动安装。", q: "看一下 GitHub 上的 imweb-ai-toolkit 仓库帮我装上。我要查我的店铺。" },
        asideH: "开箱即用",
        asideManual: "(手动)",
        asideLink: "查看完整支持矩阵 →",
        recommended: "推荐",
        statusSupported: "支持",
        statusManual: "手动",
        cards: {
          claudeCode: { title: "Claude Code", desc: "为 Claude Code 工作区添加 imweb 技能与本地 CLI 桥。" },
          codex: { title: "Codex(CLI / 应用)", desc: "在 Codex 会话中以插件形式注册工具包。" },
          mcp: { title: "Claude Desktop · 本地 MCP", desc: "接入本地 MCP 桥,让 Claude Desktop 调用本机 imweb CLI。" },
          cowork: { title: "Claude Desktop · Cowork", desc: "安装 Cowork 版技能包。" },
          skills: { title: "Agent Skills (兜底)", desc: "通过 Agent Skills CLI 暴露工具包的通用兜底方案。" },
          cursor: { title: "Cursor", desc: "Cursor 工作区通过手动配置支持,详见文档。" }
        },
        foot: {
          a: { t: "前置条件", b: "Node 18+ 与可使用 CLI 的 imweb 账户。" },
          b: { t: "都做了什么", b: "代理会在本地安装/更新官方 <code>imweb</code> CLI,并复用你已有的认证。" },
          c: { t: "然后开口", b: "打开代理,试一句: <em>「列出最近的订单。」</em>" }
        }
      },
      surfaces: {
        num: "§ 03 / 支持环境",
        h2: "支持矩阵。",
        sub: "清楚地告诉你哪里是正式支持、哪里需要手动设置、哪里暂未覆盖。",
        col: { surface: "环境", install: "安装", skills: "技能", bridge: "本地 CLI 桥", status: "状态" },
        legend: { yes: "一等支持", mid: "部分 / 手动", no: "暂未支持" },
        rows: {
          cc: "Claude Code",
          codex: "Codex CLI / 应用",
          skills: "Agent Skills CLI",
          mcp: "Claude Desktop · 本地 MCP",
          cowork: "Claude Desktop · Cowork",
          cursor: "Cursor 工作区"
        },
        pillGo: "支持",
        pillWarn: "手动"
      },
      usecases: {
        num: "§ 04 / 使用场景",
        h2: "怎么想就怎么问。",
        sub: "都是真实运营中常见的请求。每条都在官方 imweb CLI 可提供的数据与命令范围内执行 — 没有自定义查询,没有云端中转。",
        agentTag: "代理",
        cliTag: "cli",
        cards: [
          { tag: "订单 · 检查", prompt: "Use imweb tool to investigate suspicious recent orders.", agent: "查看 CLI 可读取的最近订单数据,梳理支付、取消或状态上的异常信号。", cli: "<code>imweb order list</code> · <code>imweb order get {orderNo}</code>" },
          { tag: "订单 · 信号", prompt: "Check recent orders for unusual payment or cancellation signals.", agent: "浏览最近订单,返回需要下一步查看的订单号和简短运营摘要。", cli: "<code>imweb order list</code>" },
          { tag: "商品/评价", prompt: "Review product details and recent reviews.", agent: "读取 CLI 可用的商品与评价数据,总结运营人员应关注的内容。", cli: "<code>imweb product list</code> · <code>imweb community review list</code>" },
          { tag: "店铺数据", prompt: "Inspect available store data through the imweb CLI.", agent: "根据请求,在订单、商品、评价、会员、促销和站点数据中选择合适的读取命令。", cli: "<code>imweb --help</code> · 支持的 list/detail 命令" }
        ],
        wide: {
          tag: "示例流程 · 店铺运营",
          prompt: "早上检查订单前我应该先看什么?",
          agent: "读取 CLI 可用的订单、商品与评价数据,整理成可立即执行的检查清单。",
          cli: "<code>imweb order list</code> · <code>imweb product list</code> · <code>imweb community review list</code>",
          note: "只读查看。工具包不会改价格、处理订单或修改你的店铺。"
        }
      },
      trust: {
        num: "§ 05 / 信任与边界",
        h2: "工具包会做什么,不会做什么。",
        sub: "边界本身就是产品的一部分。这里没有任何托管服务。",
        will: "会",
        wont: "不会",
        will_items: [
          "把 AI 代理接入 <strong>官方 imweb CLI</strong>。",
          "在 <strong>本地</strong> 安装 / 更新 CLI。",
          "复用你 <strong>现有的 imweb 认证</strong>,需要时引导浏览器登录。",
          "提供插件元数据、技能资产、安装脚本、文档与示例。",
          "为 Claude Desktop 提供本地 MCP 桥。"
        ],
        wont_items: [
          "托管你的店铺数据或经云中转。",
          "对店铺执行自动 <strong>写入操作</strong>。",
          "承诺 CLI 未提供的流量排名或隐藏指标。",
          "替代官方 imweb CLI — 工具包与之并行。",
          "从本站发送任何遥测或追踪。"
        ],
        foot: {
          license: { l: "许可", v: "Apache-2.0 · 工具包资产" },
          tm: { l: "商标", v: '<a href="#docs">TRADEMARKS.md →</a>' },
          dist: { l: "分发", v: "公开仓库 · GitHub Pages" },
          run: { l: "运行位置", v: "在你本机本地运行" }
        }
      },
      docs: {
        num: "§ 06 / 文档",
        h2: "上手前先翻一翻。",
        sub: "大多数团队第一周都会看的 4 份指南,加上 README。",
        items: [
          { n: "01", t: "AI 代理安装", d: "各支持环境的逐步安装。" },
          { n: "02", t: "技能的安装与使用", d: "技能如何包装 imweb CLI 命令。" },
          { n: "03", t: "CLI · 工具包集成", d: "工具包如何在本地调用官方 imweb CLI。" },
          { n: "04", t: "支持矩阵", d: "正式支持与手动支持的权威列表。" },
          { n: "R", t: "README.md", d: "项目概述、范围与贡献说明。" }
        ]
      },
      endcta: {
        num: "§ 07 / 开始使用",
        h2: "别再为同样的几个问题反复点开后台了。",
        sub: "装上工具包,把 AI 代理接上,用日常语言去问 — 剩下的交给 CLI。",
        primary: "安装工具包",
        secondary: "在 GitHub 查看 →"
      },
      foot: {
        meta1: "Apache-2.0",
        meta2: "开源工具包",
        meta3: "面向 imweb CLI 工作流的开源工具包",
        promo: {
          eyebrow: "还没有 imweb 站点?",
          title: "先在 imweb 上建站,再连接本工具包。",
          cta: "imweb.me"
        }
      },
      term: {
        you: "你",
        l1: "Use imweb tool to investigate suspicious recent orders.",
        c1: "// 代理在本地调用官方 imweb CLI",
        cli1: "imweb order list --output json",
        meta1: "已读取最近订单 · 本地 CLI",
        flag1: "多次失败后支付成功",
        flag2: "快速取消",
        result1: "有几笔订单值得查看: 一笔多次支付失败后成功,另一笔很快取消。要继续打开订单详情吗?",
        l2: "好 — 查看标记订单的详情。",
        c2: "// 代理通过 CLI 查询选中的订单详情",
        cli2: "imweb order get {orderNo} --output json"
      }
    }
  };

  window.IMWEB_I18N = I18N;
})();

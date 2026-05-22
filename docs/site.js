/* imweb-ai-toolkit landing interactions: prompt demo, copy buttons, install tabs. */

(function () {
  const replies = {
    "최근 주문 중 이상한 거 있어?": {
      cli: "imweb --output json order list --limit 20",
      card: "최근 주문 목록을 읽고 운영자가 먼저 확인할 신호를 정리합니다. 예시는 읽기 전용 데모이며, 실제 결과는 CLI 응답 범위 안에서만 만들어집니다.",
      rows: [
        ["주문 목록", "상태, 결제 흐름, 취소 여부를 함께 확인", "read"],
        ["다음 단계", "필요한 주문은 order get으로 상세 조회", "detail"],
        ["경계", "자동 승인, 취소, 배송 처리 같은 변경 작업은 실행하지 않음", "safe"],
      ],
    },
    "무통장 입금 아직 안 들어온 주문 있어?": {
      cli: "imweb --output json order list --limit 20",
      card: "주문 목록에서 결제 상태를 확인하고, 입금 확인 전에 볼 주문 후보를 좁힙니다.",
      rows: [
        ["order list", "최근 주문과 결제 상태를 먼저 확인", "read"],
        ["order get", "후보 주문의 상세 결제 정보를 재확인", "detail"],
        ["payment", "입금 확인은 별도 dry-run 절차로 사전 검토", "boundary"],
      ],
    },
    "상품 목록에서 재고 확인 후보를 골라줘": {
      cli: "imweb --output json product list --limit 20",
      card: "상품 목록과 노출된 재고·상태 정보를 읽고, 운영자가 상세 확인할 상품을 추립니다.",
      rows: [
        ["상품 상태", "판매 상태, 가격, 재고 관련 필드를 확인", "read"],
        ["상세 조회", "필요한 상품은 product get으로 이어서 확인", "detail"],
        ["변경 없음", "가격이나 재고를 자동 수정하지 않음", "safe"],
      ],
    },
    "한 달째 안 팔리는 상품 정리해줘": {
      cli: "imweb --output json product list --limit 50",
      card: "현재 CLI가 제공하는 상품 목록 안에서 판매 상태와 점검 후보를 정리합니다. 판매량 지표가 없으면 그 한계를 먼저 말합니다.",
      rows: [
        ["가능한 일", "상품 목록, 상품 상세, 리뷰 데이터를 함께 확인", "supported"],
        ["한계", "CLI에 없는 판매량·트래픽 지표는 만들지 않음", "honest"],
        ["대안", "상품 상태와 리뷰 기반 점검 목록으로 전환", "fallback"],
      ],
    },
    "별점 낮은 리뷰 중에 답변 안 한 거 모아줘": {
      cli: "imweb --output json community review cursor --limit 10",
      card: "리뷰 목록을 읽고 낮은 평점, 답변 필요 여부처럼 운영자가 확인할 항목을 정리합니다.",
      rows: [
        ["review cursor", "최근 리뷰 목록을 페이지 단위로 읽음", "read"],
        ["review get", "필요한 리뷰는 상세 조회로 확인", "detail"],
        ["answer", "답변 생성·등록은 별도 승인 흐름에서만 진행", "boundary"],
      ],
    },
    "발급된 쿠폰과 포인트 로그를 점검해줘": {
      cli: "imweb --output json promotion coupon list",
      card: "쿠폰 목록과 포인트 로그처럼 프로모션 도메인에서 조회 가능한 데이터를 먼저 확인합니다.",
      rows: [
        ["coupon list", "발급 가능한 쿠폰 정보를 조회", "read"],
        ["point log", "포인트 내역은 별도 조회 명령으로 확인", "read"],
        ["write", "쿠폰 발급·포인트 변경은 dry-run과 승인 뒤에만 진행", "guarded"],
      ],
    },
    "회원 목록에서 확인할 대상을 찾아줘": {
      cli: "imweb --output json member list --limit 50",
      card: "회원 목록을 읽고 다음에 상세 확인할 회원 후보를 정리합니다.",
      rows: [
        ["member list", "회원 식별과 기본 상태를 확인", "read"],
        ["member get", "회원 상세, 등급, 그룹 정보를 이어서 확인", "detail"],
        ["변경 전 확인", "등급 변경이나 쿠폰 발급 전 선행 조회로 사용", "safe"],
      ],
    },
    "최근 주문을 운영자가 볼 체크리스트로 정리해줘": {
      cli: "imweb --output json order list --limit 20",
      card: "최근 주문 데이터를 읽고 오늘 확인할 주문, 상세 조회가 필요한 항목, 변경 전 주의사항을 체크리스트로 정리합니다.",
      rows: [
        ["주문", "상태와 결제 흐름 확인", "read"],
        ["배송", "송장 처리 전 대상 주문 재확인", "preflight"],
        ["CS", "취소·반품·교환은 상세 조회 뒤 판단", "review"],
      ],
    },
  };

  const aliases = {
    "배송 상태를 확인해야 할 주문 골라줘": "최근 주문을 운영자가 볼 체크리스트로 정리해줘",
    "취소나 환불 흐름을 점검해줘": "최근 주문을 운영자가 볼 체크리스트로 정리해줘",
    "특정 주문 상세를 열어 확인할 항목 정리해줘": "최근 주문을 운영자가 볼 체크리스트로 정리해줘",
    "상품 상세에서 가격과 상태를 점검해줘": "상품 목록에서 재고 확인 후보를 골라줘",
    "옵션 정보가 빠진 상품이 있는지 확인해줘": "상품 목록에서 재고 확인 후보를 골라줘",
    "상품과 리뷰를 함께 보고 점검 후보를 알려줘": "상품 목록에서 재고 확인 후보를 골라줘",
    "송장 처리 전에 확인해야 할 주문을 골라줘": "최근 주문을 운영자가 볼 체크리스트로 정리해줘",
    "교환이나 반품 처리 전에 볼 주문 정보를 정리해줘": "최근 주문을 운영자가 볼 체크리스트로 정리해줘",
    "무통장 입금 확인 전에 주문 정보를 읽어줘": "무통장 입금 아직 안 들어온 주문 있어?",
    "주문 상세에서 결제 상태를 확인해줘": "무통장 입금 아직 안 들어온 주문 있어?",
    "회원 상세에서 등급과 그룹 정보를 확인해줘": "회원 목록에서 확인할 대상을 찾아줘",
    "회원 등급 변경 전에 필요한 정보를 점검해줘": "회원 목록에서 확인할 대상을 찾아줘",
    "쿠폰 발급 전에 회원 정보를 확인해줘": "회원 목록에서 확인할 대상을 찾아줘",
    "이번 주 새로 달린 리뷰 요약해줘": "별점 낮은 리뷰 중에 답변 안 한 거 모아줘",
    "자주 등장하는 불만 키워드 뽑아줘": "별점 낮은 리뷰 중에 답변 안 한 거 모아줘",
    "상품 리뷰를 보고 운영자가 확인할 항목을 정리해줘": "별점 낮은 리뷰 중에 답변 안 한 거 모아줘",
    "쿠폰 발급 전에 필요한 정보를 확인해줘": "발급된 쿠폰과 포인트 로그를 점검해줘",
    "회원별 쿠폰 발급 이력을 찾아줘": "발급된 쿠폰과 포인트 로그를 점검해줘",
    "포인트 변경 전에 현재 포인트 로그를 읽어줘": "발급된 쿠폰과 포인트 로그를 점검해줘",
  };

  function fallback(q) {
    return {
      cli: "imweb --output json config command-capabilities",
      card: `요청 <b>"${escapeHtml(q)}"</b>에 맞는 CLI read 명령을 먼저 찾고, 지원 범위 밖의 지표는 추정하지 않습니다.`,
      rows: [
        ["지원 범위", "site, order, product, member, promotion, community", "lookup"],
        ["원칙", "CLI가 제공하는 데이터만 사용", "honest"],
        ["실행 위치", "내 컴퓨터에서 로컬 실행", "local"],
      ],
    };
  }

  const demo = document.getElementById("demo");
  const demoBody = document.getElementById("demoBody");
  const input = document.getElementById("promptInput");
  const go = document.getElementById("promptGo");
  let typingCancel = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function renderReply(q) {
    if (!demo || !demoBody) return;
    if (typingCancel) typingCancel();
    demo.classList.add("is-open");
    demoBody.innerHTML = "";

    const key = aliases[q] || q;
    const reply = replies[key] || fallback(q);
    const lines = [
      { type: "comment", text: "// 에이전트가 로컬 imweb CLI를 호출" },
      { type: "cli", text: reply.cli, arrow: true },
      { type: "meta", text: "· 응답 대기 · 로컬 CLI" },
      { type: "head", text: "결과" },
      { type: "card", html: reply.card },
    ];

    reply.rows.forEach(function (row) {
      lines.push({ type: "row", id: row[0], desc: row[1], flag: row[2] });
    });
    lines.push({ type: "meta", text: "· 읽기 전용 · 데이터는 내 컴퓨터를 떠나지 않습니다." });

    let index = 0;
    let cancelled = false;
    typingCancel = function () { cancelled = true; };

    function next() {
      if (cancelled || index >= lines.length) return;
      const line = lines[index++];
      let el;

      if (line.type === "card") {
        el = document.createElement("div");
        el.className = "demo-card";
        el.innerHTML = line.html;
      } else if (line.type === "row") {
        el = document.createElement("div");
        el.className = "demo-row";
        const id = document.createElement("span");
        id.className = "id";
        id.textContent = line.id;
        const desc = document.createElement("span");
        desc.className = "desc";
        desc.textContent = line.desc;
        const flag = document.createElement("span");
        flag.className = "flag";
        flag.textContent = line.flag;
        el.append(id, desc, flag);
      } else {
        el = document.createElement("span");
        el.className = "demo-line " + line.type;
        if (line.arrow) {
          const prompt = document.createElement("span");
          prompt.className = "arrow";
          prompt.textContent = "$ ";
          el.appendChild(prompt);
        }
        el.appendChild(document.createTextNode(line.text));
      }

      demoBody.appendChild(el);
      setTimeout(next, line.type === "row" ? 120 : 200);
    }

    next();
  }

  function ask(q) {
    const text = (q || "").trim();
    if (!text || !input) return;
    input.value = text;
    renderReply(text);
    setTimeout(function () {
      const rect = demo.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        window.scrollBy({ top: rect.top - 100, behavior: "smooth" });
      }
    }, 50);
  }

  if (go && input) {
    go.addEventListener("click", function () { ask(input.value); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        ask(input.value);
      }
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      ask(chip.getAttribute("data-q"));
    });
  });

  document.querySelectorAll(".cat-q").forEach(function (button) {
    button.addEventListener("click", function () {
      const promptCard = document.getElementById("promptCard");
      if (promptCard) promptCard.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { ask(button.getAttribute("data-q")); }, 300);
    });
  });

  (function rotatePlaceholder() {
    if (!input) return;
    const examples = [
      "최근 주문 중 이상한 거 있어?",
      "상품 목록에서 재고 확인 후보를 골라줘",
      "무통장 입금 아직 안 들어온 주문 있어?",
      "별점 낮은 리뷰 중에 답변 안 한 거 모아줘",
      "발급된 쿠폰과 포인트 로그를 점검해줘",
    ];
    let i = 0;
    let j = 0;
    let dir = 1;

    function tick() {
      if (document.activeElement === input || input.value) {
        input.placeholder = "예) 최근 주문 중 이상한 거 있어?";
        setTimeout(tick, 900);
        return;
      }
      const sample = examples[i];
      j += dir;
      if (j > sample.length) {
        dir = -1;
        j = sample.length;
        setTimeout(tick, 1100);
        return;
      }
      if (j < 0) {
        dir = 1;
        j = 0;
        i = (i + 1) % examples.length;
        setTimeout(tick, 220);
        return;
      }
      input.placeholder = "예) " + sample.slice(0, j) + (dir > 0 ? "▎" : "");
      setTimeout(tick, dir > 0 ? 55 : 28);
    }

    setTimeout(tick, 600);
  })();

  document.querySelectorAll(".copy-row button, [data-copy]").forEach(function (button) {
    button.addEventListener("click", async function () {
      let text = button.getAttribute("data-copy");
      if (!text && button.parentElement) {
        const code = button.parentElement.querySelector("code");
        if (code) text = code.textContent.trim();
      }
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        button.classList.add("copied");
        const prev = button.textContent;
        button.textContent = "복사됨";
        setTimeout(function () {
          button.classList.remove("copied");
          button.textContent = prev;
        }, 1400);
      } catch (error) {
        button.classList.remove("copied");
      }
    });
  });

  (function initInstallTabs() {
    const tabs = document.getElementById("installTabs");
    if (!tabs) return;
    const buttons = tabs.querySelectorAll(".tab-btn");
    const panels = tabs.querySelectorAll(".tab-panel");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const key = button.getAttribute("data-tab");
        buttons.forEach(function (candidate) {
          const isOn = candidate === button;
          candidate.classList.toggle("is-on", isOn);
          candidate.setAttribute("aria-selected", isOn ? "true" : "false");
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-on", panel.getAttribute("data-tab") === key);
        });
      });
    });
  })();
})();

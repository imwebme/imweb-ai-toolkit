/* imweb-ai-toolkit — i18n runtime, terminal demo, copy buttons. */

(function () {
  const SUPPORTED = ["en", "ko", "ja", "zh"];
  const DEFAULT = "en";
  const I18N = window.IMWEB_I18N || {};

  // ---------- Helpers ----------
  function getByPath(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return (o && o[k] !== undefined) ? o[k] : undefined;
    }, obj);
  }

  function detectLang() {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;
    try {
      const stored = localStorage.getItem("imweb_lang");
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (e) {}
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("ko")) return "ko";
    if (nav.startsWith("ja")) return "ja";
    if (nav.startsWith("zh")) return "zh";
    return DEFAULT;
  }

  function applyI18n(lang) {
    const dict = I18N[lang] || I18N[DEFAULT];
    if (!dict) return;

    document.documentElement.setAttribute("lang", lang);
    document.title = getByPath(dict, "meta.title") || document.title;

    // text content
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const v = getByPath(dict, el.getAttribute("data-i18n"));
      if (typeof v === "string") el.textContent = v;
    });
    // html content
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      const v = getByPath(dict, el.getAttribute("data-i18n-html"));
      if (typeof v === "string") el.innerHTML = v;
    });
    // attribute content e.g. content:meta.description
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      const spec = el.getAttribute("data-i18n-attr");
      const parts = spec.split(":");
      if (parts.length !== 2) return;
      const v = getByPath(dict, parts[1].trim());
      if (typeof v === "string") el.setAttribute(parts[0].trim(), v);
    });

    // Render dynamic blocks
    renderUsecases(dict);
    renderTrustLists(dict);
    renderDocsList(dict);

    // Lang switcher state
    const cur = document.getElementById("lang-current");
    if (cur) cur.textContent = lang.toUpperCase();
    document.querySelectorAll("#lang-menu li").forEach(function (li) {
      li.classList.toggle("is-active", li.getAttribute("data-lang") === lang);
    });

    // Reset terminal demo
    resetTerminal(dict);
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT;
    try { localStorage.setItem("imweb_lang", lang); } catch (e) {}
    applyI18n(lang);

    // Update URL without reload
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    } catch (e) {}
  }

  // ---------- Use cases ----------
  function renderUsecases(dict) {
    const grid = document.getElementById("cases-grid");
    if (!grid) return;
    const u = dict.usecases || {};
    const cards = u.cards || [];
    grid.innerHTML = cards.map(function (c) {
      return (
        '<article class="case">' +
          '<div class="case-tag">' + escapeHtml(c.tag) + '</div>' +
          '<div class="case-prompt"><span class="case-quote">“</span>' + escapeHtml(c.prompt) + '<span class="case-quote">”</span></div>' +
          '<div class="case-body">' +
            '<div class="case-line"><span class="case-line-tag">' + escapeHtml(u.agentTag || "agent") + '</span><span>' + escapeHtml(c.agent) + '</span></div>' +
            '<div class="case-line"><span class="case-line-tag">' + escapeHtml(u.cliTag || "cli") + '</span><span>' + (c.cli || "") + '</span></div>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    // Wide example
    const w = u.wide;
    if (w) {
      grid.insertAdjacentHTML("beforeend",
        '<article class="case case-wide">' +
          '<div class="case-tag">' + escapeHtml(w.tag) + '</div>' +
          '<div class="case-prompt"><span class="case-quote">“</span>' + escapeHtml(w.prompt) + '<span class="case-quote">”</span></div>' +
          '<div class="case-body">' +
            '<div class="case-line"><span class="case-line-tag">' + escapeHtml(u.agentTag || "agent") + '</span><span>' + escapeHtml(w.agent) + '</span></div>' +
            '<div class="case-line"><span class="case-line-tag">' + escapeHtml(u.cliTag || "cli") + '</span><span>' + (w.cli || "") + '</span></div>' +
            '<div class="case-line case-line-note">' + escapeHtml(w.note) + '</div>' +
          '</div>' +
        '</article>'
      );
    }
  }

  // ---------- Trust lists ----------
  function renderTrustLists(dict) {
    const t = dict.trust || {};
    const willEl = document.getElementById("trust-will-list");
    const wontEl = document.getElementById("trust-wont-list");
    if (willEl) willEl.innerHTML = (t.will_items || []).map(function (i) { return "<li>" + i + "</li>"; }).join("");
    if (wontEl) wontEl.innerHTML = (t.wont_items || []).map(function (i) { return "<li>" + i + "</li>"; }).join("");
  }

  // ---------- Docs list ----------
  function renderDocsList(dict) {
    const root = document.getElementById("doclist");
    if (!root) return;
    const items = (dict.docs && dict.docs.items) || [];
    const hrefs = [
      "ai-agent-installation.md",
      "skill-installation-and-usage.md",
      "cli-toolkit-integration.md",
      "surface-support-matrix.md",
      "https://github.com/imwebme/imweb-ai-toolkit#readme"
    ];
    root.innerHTML = items.map(function (it, idx) {
      return (
        '<li><a class="doc" href="' + (hrefs[idx] || "#") + '">' +
          '<span class="doc-num">' + escapeHtml(it.n) + '</span>' +
          '<span class="doc-meta">' +
            '<span class="doc-title">' + escapeHtml(it.t) + '</span>' +
            '<span class="doc-desc">' + escapeHtml(it.d) + '</span>' +
          '</span>' +
          '<span class="doc-arrow" aria-hidden="true">→</span>' +
        '</a></li>'
      );
    }).join("");
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  // ---------- Lang switcher UI ----------
  function initLangSwitcher() {
    const btn = document.getElementById("lang-toggle");
    const menu = document.getElementById("lang-menu");
    if (!btn || !menu) return;

    function open() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    function close() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) open(); else close();
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && e.target !== btn) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    menu.querySelectorAll("li").forEach(function (li) {
      li.addEventListener("click", function () {
        const lang = li.getAttribute("data-lang");
        if (lang) {
          setLang(lang);
          close();
        }
      });
    });
  }

  // ---------- Copy buttons ----------
  function initCopyButtons() {
    document.querySelectorAll("[data-copy], [data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        let text = "";
        const target = btn.getAttribute("data-copy-target");
        if (target) {
          const el = document.querySelector(target);
          if (el) text = el.textContent.trim();
        } else {
          const pre = btn.parentElement.querySelector("pre code");
          if (!pre) return;
          text = pre.textContent.replace(/^\$\s+/, "");
        }
        if (!text) return;
        const label = btn.querySelector("span") || btn;
        const prev = label.textContent;
        const done = function () {
          label.textContent = "Copied";
          btn.classList.add("copied");
          setTimeout(function () {
            label.textContent = prev || "Copy";
            btn.classList.remove("copied");
          }, 1400);
        };
        try {
          navigator.clipboard.writeText(text).then(done, done);
        } catch (e) { done(); }
      });
    });
  }

  // ---------- Terminal demo ----------
  let termTimer = null;
  let termObserver = null;
  let termRunning = false;

  function buildTermScript(dict) {
    const t = dict.term || {};
    return [
      { t: "user", text: t.l1, you: t.you },
      { t: "comment", text: t.c1 },
      { t: "cli", text: t.cli1 },
      { t: "meta", text: t.meta1 },
      { t: "row", html: '<span class="col-id">#A-48219</span>  KRW 184,000  paid  <span class="col-flag">⚑ ' + escapeHtml(t.flag1 || "multi-fail-then-paid") + '</span>' },
      { t: "row", html: '<span class="col-id">#A-48217</span>  KRW  62,500  paid  ok' },
      { t: "row", html: '<span class="col-id">#A-48214</span>  KRW 318,400  cancelled  <span class="col-flag">⚑ ' + escapeHtml(t.flag2 || "cancelled <90s") + '</span>' },
      { t: "row", html: '<span class="col-id">#A-48212</span>  KRW  41,000  paid  ok' },
      { t: "result", text: t.result1 },
      { t: "user", text: t.l2, you: t.you },
      { t: "comment", text: t.c2 },
      { t: "cli", text: t.cli2 }
    ];
  }

  function appendLine(body, item) {
    const el = document.createElement("div");
    el.className = "term-line";
    if (item.t === "user") {
      el.classList.add("term-user");
      el.innerHTML = '<span class="term-tag">' + escapeHtml(item.you || "you") + '</span><span class="term-prompt">›</span>' + escapeHtml(item.text);
    } else if (item.t === "comment") {
      el.classList.add("term-comment");
      el.textContent = item.text;
    } else if (item.t === "cli") {
      el.classList.add("term-cli");
      el.innerHTML = '<span class="term-arrow">→</span>' + escapeHtml(item.text);
    } else if (item.t === "meta") {
      el.classList.add("term-meta");
      el.textContent = item.text;
    } else if (item.t === "row") {
      el.classList.add("term-row");
      el.innerHTML = item.html;
    } else if (item.t === "result") {
      el.classList.add("term-result");
      el.textContent = item.text;
    }
    body.appendChild(el);
    while (body.scrollHeight > body.clientHeight + 4 && body.children.length > 4) {
      body.removeChild(body.children[0]);
    }
  }

  function resetTerminal(dict) {
    const body = document.getElementById("term-body");
    if (!body) return;
    if (termTimer) { clearTimeout(termTimer); termTimer = null; }
    body.innerHTML = "";
    termRunning = false;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const script = buildTermScript(dict);

    if (prefersReduced) {
      script.forEach(function (s) { appendLine(body, s); });
      return;
    }

    let i = 0;
    function step() {
      if (i >= script.length) {
        termTimer = setTimeout(function () {
          body.innerHTML = "";
          i = 0;
          step();
        }, 4500);
        return;
      }
      const item = script[i++];
      appendLine(body, item);

      let delay;
      if (item.t === "user") delay = 1100;
      else if (item.t === "comment") delay = 500;
      else if (item.t === "cli") delay = 750;
      else if (item.t === "meta") delay = 350;
      else if (item.t === "row") delay = 220;
      else if (item.t === "result") delay = 1500;
      else delay = 600;
      termTimer = setTimeout(step, delay);
    }

    function start() {
      if (termRunning) return;
      termRunning = true;
      step();
    }

    if ("IntersectionObserver" in window) {
      if (termObserver) termObserver.disconnect();
      termObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start();
        });
      }, { threshold: 0.1 });
      termObserver.observe(body);
    } else {
      start();
    }
  }

  // ---------- Mobile menu ----------
  function initMobileMenu() {
    const btn = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!btn || !menu) return;
    function close() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function open() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    btn.addEventListener("click", function () {
      if (menu.hidden) open(); else close();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1020) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // ---------- Boot ----------
  function boot() {
    initLangSwitcher();
    initMobileMenu();
    initCopyButtons();
    const lang = detectLang();
    applyI18n(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

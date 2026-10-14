"use client";
/* 全元素可视化编辑器（升级版）：移植自 wolf-fansite-design editor.js
   新增：图片替换、动效预设、字体下拉、Markdown 块、持久化走 /api/page-content */
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type Snapshot = {
  styles: { path: string; style: string; text: string | null; hidden: boolean; anim?: string }[];
  added: { parent: string; html: string; left?: string; top?: string }[];
  savedAt?: string;
};

const ANIMS: [string, string][] = [
  ["", "无"],
  ["ck-anim-fadein", "淡入"],
  ["ck-anim-float", "上浮"],
  ["ck-anim-pulse", "脉冲"],
  ["ck-anim-shake", "摇晃"],
  ["ck-anim-pop", "弹跳"],
  ["ck-anim-slide-l", "左滑入"],
  ["ck-anim-slide-r", "右滑入"],
];
const FONTS: [string, string][] = [
  ["", "继承"],
  ["system-ui, sans-serif", "系统默认"],
  ["'Noto Serif SC', serif", "宋体（衬线）"],
  ["'Noto Sans SC', sans-serif", "黑体"],
  ["serif", "衬线"],
  ["monospace", "等宽"],
];

export default function SiteVisualEditor() {
  const pathname = usePathname();
  const pageKey = pathname === "/" ? "home" : pathname.replace(/^\//, "").split("/")[0] || "home";
  const [isAdmin, setIsAdmin] = useState(false);
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState("");
  const snapRef = useRef<Snapshot>({ styles: [], added: [] });
  const dirtyRef = useRef(false);

  const say = useCallback((m: string) => {
    setStatus(m);
    setTimeout(() => setStatus((s) => (s === m ? "" : s)), 2200);
  }, []);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) =>
      setIsAdmin(!!d.user && (d.user.role === "ADMIN" || d.user.role === "OWNER"))
    ).catch(() => {});
    fetch(`/api/page-content?page=${pageKey}`).then((r) => r.json()).then((d) => {
      if (d.data?.veditor) snapRef.current = d.data.veditor;
    }).catch(() => {});
  }, [pageKey]);

  const persist = useCallback(async () => {
    const res = await fetch("/api/page-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageKey, data: { veditor: snapRef.current } }),
    });
    dirtyRef.current = false;
    say(res.ok ? "已保存，刷新后保留" : "保存失败：请重新登录");
  }, [pageKey, say]);

  useEffect(() => {
    if (!on || !isAdmin) return;
    let killer = () => {};
    (async () => {
    try {
    const IGNORE =
      "#ck-ved-fab,#ck-ved-panel,#ck-ved-guides,#ck-ved-handles,script,style,link,noscript";
    let records: { id2?: string; el: HTMLElement; parent: HTMLElement | null; collapsed: boolean; name: string; kind: string }[] = [];
    let selected: HTMLElement | null = null;
    let nextId = 1;
    const editingCss: Record<string, string> = {};
    const contentChanges: Record<string, string> = {};
    const animChanges: Record<string, string> = {};
    let snapEnabled = true, noSnap = false;
    const SNAP_TOL = 7;
    let rafId = 0;
    const schedule = (fn: () => void) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { rafId = 0; fn(); });
    };
    const lockPage = () => document.body.classList.add("ck-ved-lock");
    const unlockPage = () => document.body.classList.remove("ck-ved-lock");
    const uid = (el: HTMLElement) => {
      if (!el.dataset.ckVedId) el.dataset.ckVedId = "n" + nextId++;
      return el.dataset.ckVedId;
    };
    const isProt = (el: Element | null) => !!el && !!el.closest(IGNORE);
    const label = (el: HTMLElement) => {
      let t = (el.dataset.dpName || el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ");
      if (t.length > 24) t = t.slice(0, 24) + "…";
      return t || el.tagName.toLowerCase();
    };
    const kindName = (el: HTMLElement) => {
      if (el.tagName === "IMG") return "图片";
      if (/^H[1-6]$/.test(el.tagName)) return "标题";
      if (el.tagName === "P") return "段落";
      if (el.classList.contains("ck-btn") || el.tagName === "BUTTON") return "按钮";
      if (el.classList.contains("ck-card")) return "卡片";
      return el.tagName.toLowerCase();
    };
    const scan = () => {
      records = [];
      document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
        if (isProt(el) || el === document.body || el.tagName === "BR" || el.tagName === "SVG" || records.some((r) => r.el === el)) return;
        if (el.children.length > 0 && !el.matches("p,h1,h2,h3,h4,h5,h6,span,a,button,img,li,div.ck-card")) return;
        records.push({ el, parent: null, collapsed: false, name: label(el), kind: kindName(el) });
      });
      records.forEach((r) => {
        let p = r.el.parentElement;
        while (p && p !== document.body && !isProt(p)) {
          const pr = records.find((x) => x.el === p);
          if (pr) { r.parent = pr.el; break; }
          p = p.parentElement;
        }
      });
    };
    /* ---------- 选择 ---------- */
    const handlesBox = document.createElement("div");
    handlesBox.id = "ck-ved-handles";
    document.body.appendChild(handlesBox);
    const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    HANDLES.forEach((h) => {
      const d = document.createElement("div");
      d.className = "ck-ved-handle";
      d.dataset.h = h;
      handlesBox.appendChild(d);
    });
    const positionHandles = () => {
      if (!selected) { handlesBox.style.display = "none"; return; }
      const b = selected.getBoundingClientRect();
      if (b.width < 2 && b.height < 2) { handlesBox.style.display = "none"; return; }
      handlesBox.style.display = "block";
      handlesBox.style.left = b.left + "px";
      handlesBox.style.top = b.top + "px";
      handlesBox.style.width = b.width + "px";
      handlesBox.style.height = b.height + "px";
      handlesBox.querySelectorAll<HTMLElement>(".ck-ved-handle").forEach((h) => {
        const dir = h.dataset.h || "";
        h.style.left = dir.includes("w") ? "0" : dir.includes("e") ? "100%" : "50%";
        h.style.top = dir.includes("n") ? "0" : dir.includes("s") ? "100%" : "50%";
      });
    };
    const removeHandles = () => { handlesBox.style.display = "none"; };
    /* ---------- 磁吸 ---------- */
    const guidesBox = document.createElement("div");
    guidesBox.id = "ck-ved-guides";
    document.body.appendChild(guidesBox);
    window.addEventListener("keydown", (e) => { if (e.altKey) noSnap = true; });
    window.addEventListener("keyup", (e) => { if (!e.altKey) noSnap = false; });
    const collectTargets = (exclude: HTMLElement) => {
      const W = window.innerWidth, H = window.innerHeight;
      const xs = [0, W / 2, W], ys = [0, H / 2, H];
      records.forEach((r) => {
        const el = r.el;
        if (el === exclude || isProt(el)) return;
        const b = el.getBoundingClientRect();
        if (b.width < 2 && b.height < 2) return;
        if (b.bottom < -400 || b.top > H + 400) return;
        xs.push(b.left, b.left + b.width / 2, b.right);
        ys.push(b.top, b.top + b.height / 2, b.bottom);
      });
      return { W, H, xs, ys };
    };
    const showGuides = (list: { dir: string; pos: number; center: boolean }[]) => {
      guidesBox.innerHTML = "";
      document.body.classList.toggle("ck-ved-snapping", list.length > 0);
      list.forEach((g) => {
        const d = document.createElement("div");
        d.className = "ck-ved-guide " + g.dir + (g.center ? " at-center" : "");
        if (g.dir === "v") d.style.left = Math.round(g.pos) + "px";
        else d.style.top = Math.round(g.pos) + "px";
        guidesBox.appendChild(d);
      });
    };
    const clearGuides = () => { guidesBox.innerHTML = ""; document.body.classList.remove("ck-ved-snapping"); };
    const isCenter = (v: number, total: number) => Math.abs(v - total / 2) < 1;
    const snapAxis = (lines: number[], targets: number[]) => {
      if (noSnap || !snapEnabled) return null;
      let best: { d: number; at: number } | null = null;
      for (const l of lines) for (const t of targets) {
        const d = t - l;
        if (Math.abs(d) <= SNAP_TOL && (best === null || Math.abs(d) < Math.abs(best.d)))
          best = { d, at: t };
      }
      return best;
    };
    const makeLayoutable = (el: HTMLElement) => {
      const d = getComputedStyle(el).display;
      if (d === "inline" || d === "contents") el.style.display = "inline-block";
    };
    /* ---------- 拖动 ---------- */
    const startMove = (e: PointerEvent) => {
      if (!selected) return;
      if ((e.target as HTMLElement).closest("#ck-ved-panel,#ck-ved-handles,#ck-ved-fab")) return;
      if (e.button !== 0) return;
      const el = selected;
      if (!(el === e.target || el.contains(e.target as Node))) return;
      makeLayoutable(el);
      const cs = getComputedStyle(el);
      if (cs.position === "static") el.style.position = "relative";
      if (!el.style.left) el.style.left = "0px";
      if (!el.style.top) el.style.top = "0px";
      const start = { id: e.pointerId, x: e.clientX, y: e.clientY, l: parseFloat(el.style.left) || 0, t: parseFloat(el.style.top) || 0 };
      const startRect = el.getBoundingClientRect();
      let moved = false;
      const targets = collectTargets(el);
      e.preventDefault();
      lockPage();
      el.classList.add("ck-ved-dragging");
      const move = (ev: PointerEvent) => {
        if (ev.buttons === 0 || ev.pointerId !== start.id) { up(); return; }
        let dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        const guides: { dir: string; pos: number; center: boolean }[] = [];
        const sX = snapAxis([startRect.left + dx, startRect.left + startRect.width / 2 + dx, startRect.right + dx], targets.xs);
        if (sX) dx += sX.d;
        const sY = snapAxis([startRect.top + dy, startRect.top + startRect.height / 2 + dy, startRect.bottom + dy], targets.ys);
        if (sY) dy += sY.d;
        if (sX) guides.push({ dir: "v", pos: sX.at, center: isCenter(sX.at, targets.W) });
        if (sY) guides.push({ dir: "h", pos: sY.at, center: isCenter(sY.at, targets.H) });
        schedule(() => {
          el.style.left = Math.round(start.l + dx) + "px";
          el.style.top = Math.round(start.t + dy) + "px";
          positionHandles();
          showGuides(guides);
          say("位移 " + Math.round(dx) + ", " + Math.round(dy) + (guides.length ? " · 已吸附" : ""));
        });
      };
      const up = () => {
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", up, true);
        document.removeEventListener("pointercancel", up, true);
        el.classList.remove("ck-ved-dragging");
        clearGuides();
        unlockPage();
        if (moved) { editingCss[uid(el)] = el.getAttribute("style") || ""; dirtyRef.current = true; }
      };
      document.addEventListener("pointermove", move, true);
      document.addEventListener("pointerup", up, true);
      document.addEventListener("pointercancel", up, true);
    };
    /* ---------- 缩放 ---------- */
    const startResize = (e: PointerEvent) => {
      if (!selected) return;
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      const el = selected;
      makeLayoutable(el);
      const dir = (e.currentTarget as HTMLElement).dataset.h || "";
      const rect = el.getBoundingClientRect();
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const base = { l: parseFloat(el.style.left) || 0, t: parseFloat(el.style.top) || 0 };
      const start = { id: e.pointerId, x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, L: rect.left, T: rect.top, R: rect.right, B: rect.bottom };
      el.style.maxWidth = "none";
      el.style.boxSizing = "border-box";
      const targets = collectTargets(el);
      lockPage();
      const last = { w: start.w, h: start.h };
      const move = (ev: PointerEvent) => {
        if (ev.buttons === 0 || ev.pointerId !== start.id) { up(); return; }
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        let w = start.w, h = start.h;
        const east = dir.includes("e"), west = dir.includes("w"), south = dir.includes("s"), north = dir.includes("n");
        if (east) w = start.w + dx;
        if (west) w = start.w - dx;
        if (south) h = start.h + dy;
        if (north) h = start.h - dy;
        const guides: { dir: string; pos: number; center: boolean }[] = [];
        let dLeft = 0, dTop = 0;
        if (east) { const s = snapAxis([start.L + w], targets.xs); if (s) { w += s.d; guides.push({ dir: "v", pos: s.at, center: isCenter(s.at, targets.W) }); } }
        if (west) { const s = snapAxis([start.R - w], targets.xs); if (s) { dLeft = s.d; w -= s.d; guides.push({ dir: "v", pos: s.at, center: isCenter(s.at, targets.W) }); } }
        if (south) { const s = snapAxis([start.T + h], targets.ys); if (s) { h += s.d; guides.push({ dir: "h", pos: s.at, center: isCenter(s.at, targets.H) }); } }
        if (north) { const s = snapAxis([start.B - h], targets.ys); if (s) { dTop = s.d; h -= s.d; guides.push({ dir: "h", pos: s.at, center: isCenter(s.at, targets.H) }); } }
        last.w = Math.max(24, Math.round(w)); last.h = Math.max(20, Math.round(h));
        schedule(() => {
          if (east || west) el.style.width = last.w + "px";
          if (south || north) el.style.height = last.h + "px";
          if (west) el.style.left = Math.round(base.l + dLeft) + "px";
          if (north) el.style.top = Math.round(base.t + dTop) + "px";
          positionHandles();
          showGuides(guides);
          say("尺寸 " + last.w + "×" + last.h + (guides.length ? " · 已吸附" : ""));
        });
      };
      const up = () => {
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", up, true);
        document.removeEventListener("pointercancel", up, true);
        clearGuides();
        unlockPage();
        editingCss[uid(el)] = el.getAttribute("style") || "";
        dirtyRef.current = true;
        say("已调整尺寸 " + last.w + "×" + last.h);
      };
      document.addEventListener("pointermove", move, true);
      document.addEventListener("pointerup", up, true);
      document.addEventListener("pointercancel", up, true);
    };
    handlesBox.querySelectorAll<HTMLElement>(".ck-ved-handle").forEach((h) => {
      h.addEventListener("pointerdown", startResize as unknown as EventListener);
    });
    /* ---------- 文本读写（保留子元素，br↔换行） ---------- */
    const editableText = (el: HTMLElement) => {
      let out = "";
      el.childNodes.forEach((n) => {
        if (n.nodeType === 3) out += n.nodeValue;
        else if (n.nodeName === "BR") out += "\n";
      });
      return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    };
    const setEditableText = (el: HTMLElement, value: string) => {
      const firstText = Array.from(el.childNodes).find((n) => n.nodeType === 3 || n.nodeName === "BR") as ChildNode | undefined;
      let after: ChildNode | null = null;
      if (firstText) {
        let n: ChildNode | null = firstText.nextSibling;
        while (n && (n.nodeType === 3 || n.nodeName === "BR")) n = n.nextSibling;
        after = n;
      }
      Array.from(el.childNodes).forEach((n) => { if (n.nodeType === 3 || n.nodeName === "BR") el.removeChild(n); });
      const frag = document.createDocumentFragment();
      String(value).split("\n").forEach((p, i) => {
        if (i) frag.appendChild(document.createElement("br"));
        if (p) frag.appendChild(document.createTextNode(p));
      });
      if (after) el.insertBefore(frag, after); else el.appendChild(frag);
    };
    /* ---------- 快照（cssPath 定位 + 内联样式 + 文本/动效/新增） ---------- */
    const cssPath = (el: HTMLElement | null): string => {
      if (!el || el === document.body) return "body";
      const parts: string[] = [];
      let cur: HTMLElement | null = el;
      while (cur && cur !== document.body) {
        let part = cur.tagName.toLowerCase();
        if (cur.id) { parts.unshift(part + "#" + CSS.escape(cur.id)); break; }
        const same = Array.prototype.filter.call(cur.parentElement ? cur.parentElement.children : [], (x) => x.tagName === cur?.tagName);
        if (same.length > 1) part += ":nth-of-type(" + (same.indexOf(cur) + 1) + ")";
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return "body > " + parts.join(" > ");
    };
    const snapshot = () => {
      const styles = records.map((r) => ({
        path: cssPath(r.el),
        style: r.el.getAttribute("style") || "",
        text: contentChanges[uid(r.el)] ?? null,
        hidden: r.el.style.display === "none",
        anim: animChanges[uid(r.el)] || undefined,
      }));
      const added = Array.from(document.querySelectorAll<HTMLElement>(".ck-added"))
        .filter((el) => !el.parentElement?.closest(".ck-added"))
        .map((el) => ({ parent: cssPath(el.parentElement), html: el.outerHTML }));
      snapRef.current = { styles, added, savedAt: new Date().toISOString() };
    };
    /* ---------- 面板 ---------- */
    const panel = document.createElement("aside");
    panel.id = "ck-ved-panel";
    panel.innerHTML =
      '<header id="ck-ved-head"><b>元素编辑</b><span id="ck-ved-name">未选择</span>' +
      '<button id="ck-ved-snap" title="磁吸对齐 开/关（按住 Alt 临时关闭）">磁吸</button>' +
      '<button id="ck-ved-min" title="收起/展开">▾</button><button id="ck-ved-close" title="退出编辑">×</button></header>' +
      '<div id="ck-ved-body"><div class="ck-ved-hint">点击页面元素开始编辑。可拖动、八向缩放、磁吸对齐。</div></div>' +
      '<footer id="ck-ved-foot"><span id="ck-ved-status"></span><button id="ck-ved-save" class="primary">保存全部</button></footer>';
    document.body.appendChild(panel);
    const body = panel.querySelector("#ck-ved-body") as HTMLElement;
    const nameEl = panel.querySelector("#ck-ved-name") as HTMLElement;
    const statusEl = panel.querySelector("#ck-ved-status") as HTMLElement;
    (panel.querySelector("#ck-ved-status") as HTMLElement).textContent = "";
    panel.querySelector("#ck-ved-min")!.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("ck-min");
      (panel.querySelector("#ck-ved-min") as HTMLElement).textContent = panel.classList.contains("ck-min") ? "▴" : "▾";
    });
    panel.querySelector("#ck-ved-close")!.addEventListener("click", () => setOn(false));
    panel.querySelector("#ck-ved-save")!.addEventListener("click", () => { snapshot(); persist(); });
    const snapBtn = panel.querySelector("#ck-ved-snap") as HTMLElement;
    snapBtn.addEventListener("click", () => {
      snapEnabled = !snapEnabled;
      snapBtn.classList.toggle("off", !snapEnabled);
      say(snapEnabled ? "磁吸已开启" : "磁吸已关闭（Alt 临时开关）");
    });
    /* 面板拖动 */
    (() => {
      const head = panel.querySelector("#ck-ved-head") as HTMLElement;
      let drag: { id: number; x: number; y: number; ox: number; oy: number } | null = null;
      head.addEventListener("pointerdown", (e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        const r = panel.getBoundingClientRect();
        panel.style.left = r.left + "px";
        panel.style.top = r.top + "px";
        panel.style.right = "auto";
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: r.left, oy: r.top };
        try { head.setPointerCapture(e.pointerId); } catch { /* noop */ }
        e.preventDefault();
      });
      head.addEventListener("pointermove", (e) => {
        if (!drag) return;
        if (e.buttons === 0 || e.pointerId !== drag.id) { drag = null; return; }
        panel.style.left = Math.max(0, drag.ox + e.clientX - drag.x) + "px";
        panel.style.top = Math.max(0, drag.oy + e.clientY - drag.y) + "px";
      });
      window.addEventListener("pointerup", () => { drag = null; }, true);
    })();
    /* 面板控件工具 */
    const section = (title: string) => {
      const d = document.createElement("section");
      d.className = "ck-ved-sec";
      d.innerHTML = "<h4>" + title + "</h4>";
      body.appendChild(d);
      return d;
    };
    const row = (parent: HTMLElement, title: string, ctrl: HTMLElement) => {
      const d = document.createElement("div");
      d.className = "ck-ved-row";
      d.innerHTML = "<label>" + title + "</label>";
      d.appendChild(ctrl);
      parent.appendChild(d);
      return d;
    };
    const mkBtn = (parent: HTMLElement, text: string, cls: string, fn: () => void) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = text; if (cls) b.className = cls; b.onclick = fn;
      parent.appendChild(b);
      return b;
    };
    const styleValue = (el: HTMLElement, p: string) => (getComputedStyle(el) as unknown as Record<string, string>)[p];
    const remember = (el: HTMLElement) => { editingCss[uid(el)] = el.getAttribute("style") || ""; dirtyRef.current = true; };
    /* ---------- 属性面板渲染 ---------- */
    const renderPanel = (el: HTMLElement | null) => {
      body.innerHTML = "";
      if (!el) {
        body.innerHTML = '<div class="ck-ved-hint">点击页面元素开始编辑。<br/>拖动移动 · 把手缩放 · 磁吸对齐。</div>';
        return;
      }
      const rec = records.find((r) => r.el === el);
      nameEl.textContent = rec ? rec.kind + " · " + rec.name : label(el);
      /* 内容 */
      if (el.tagName !== "IMG") {
        const sec = section("内容");
        const ta = document.createElement("textarea");
        ta.rows = 3; ta.value = editableText(el);
        ta.placeholder = "可换行；Markdown：## 标题 **粗体** [链接](url)";
        row(sec, "文字", ta);
        ta.onchange = () => {
          setEditableText(el, ta.value);
          editingCss[uid(el)] = el.getAttribute("style") || "";
          contentChanges[uid(el)] = ta.value;
          dirtyRef.current = true;
          say("已更新文字");
        };
      }
      /* 图片 */
      if (el.tagName === "IMG") {
        const sec = section("图片");
        const inp = document.createElement("input");
        inp.type = "text";
        inp.value = (el as HTMLImageElement).src;
        inp.placeholder = "图片地址 URL";
        row(sec, "地址", inp);
        inp.onchange = () => {
          (el as HTMLImageElement).src = inp.value;
          editingCss[uid(el)] = el.getAttribute("style") || "";
          contentChanges[uid(el)] = inp.value;
          dirtyRef.current = true;
          say("已替换图片");
        };
        const w = document.createElement("input"); w.type = "number"; w.value = String((el as HTMLImageElement).width || 0); w.placeholder = "宽";
        row(sec, "宽", w);
        w.onchange = () => { el.style.width = w.value + "px"; remember(el); };
        const h2 = document.createElement("input"); h2.type = "number"; h2.value = String((el as HTMLImageElement).height || 0); h2.placeholder = "高";
        row(sec, "高", h2);
        h2.onchange = () => { el.style.height = h2.value + "px"; remember(el); };
      }
      /* 动效 */
      {
        const sec = section("动效");
        const sel = document.createElement("select");
        ANIMS.forEach(([v, n]) => { const o = document.createElement("option"); o.value = v; o.textContent = n; sel.appendChild(o); });
        sel.value = el.dataset.ckAnim || "";
        row(sec, "预设", sel);
        sel.onchange = () => {
          el.classList.remove(...ANIMS.map(([v]) => v).filter(Boolean));
          el.dataset.ckAnim = sel.value;
          if (sel.value) {
            el.classList.add(sel.value);
            /* 重触发动画 */
            el.style.animation = "none";
            void el.offsetHeight;
            el.style.animation = "";
          }
          animChanges[uid(el)] = sel.value;
          editingCss[uid(el)] = el.getAttribute("style") || "";
          dirtyRef.current = true;
          say(sel.value ? "动效已应用：" + ANIMS.find(([v]) => v === sel.value)?.[1] : "动效已移除");
        };
      }
      /* 外观 */
      const sec2 = section("外观");
      const colorHex = (v: string) => {
        const m = (v || "").match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
        if (!m) return /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#ffffff";
        return "#" + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, "0")).join("");
      };
      const color = document.createElement("input"); color.type = "color"; color.value = colorHex(styleValue(el, "color"));
      row(sec2, "文字色", color);
      color.oninput = () => { el.style.color = color.value; remember(el); };
      const bg = document.createElement("input"); bg.type = "color"; bg.value = colorHex(styleValue(el, "backgroundColor"));
      row(sec2, "背景色", bg);
      bg.oninput = () => { el.style.backgroundColor = bg.value; remember(el); };
      const font = document.createElement("select");
      FONTS.forEach(([v, n]) => { const o = document.createElement("option"); o.value = v; o.textContent = n; font.appendChild(o); });
      row(sec2, "字体", font);
      font.onchange = () => { el.style.fontFamily = font.value; remember(el); };
      const size = document.createElement("input"); size.type = "range"; size.min = "8"; size.max = "120";
      size.value = String(parseInt(styleValue(el, "fontSize"), 10) || 14);
      const sizeRow = row(sec2, "字号", size);
      const sizeNum = document.createElement("input"); sizeNum.type = "number"; sizeNum.className = "ck-num"; sizeNum.value = size.value;
      sizeRow.appendChild(sizeNum);
      const applySize = (v: string) => {
        const n = Math.max(8, Math.min(400, parseInt(v, 10) || 14));
        el.style.fontSize = n + "px";
        size.value = String(n); sizeNum.value = String(n);
        remember(el); positionHandles();
      };
      size.oninput = () => applySize(size.value);
      sizeNum.oninput = () => applySize(sizeNum.value);
      const applyAll = document.createElement("button"); applyAll.type = "button"; applyAll.textContent = "应用到内部文字"; applyAll.className = "ck-mini";
      applyAll.onclick = () => {
        const v = Math.max(8, Math.min(400, parseInt(sizeNum.value, 10) || 14));
        let n = 0;
        el.querySelectorAll<HTMLElement>("*").forEach((k) => {
          if (!k.textContent?.trim()) return;
          let hasEl = false;
          for (const c of Array.from(k.children)) if (c.tagName !== "BR") { hasEl = true; break; }
          if (hasEl) return;
          k.style.fontSize = v + "px"; n++;
        });
        if (!n && el.textContent?.trim()) { el.style.fontSize = v + "px"; n = 1; }
        remember(el); positionHandles();
        say(n ? "已同步 " + n + " 处内部文字" : "该元素没有可单独设置字号的子文字");
      };
      sizeRow.appendChild(applyAll);
      const lh = document.createElement("input"); lh.type = "range"; lh.min = "10"; lh.max = "30";
      lh.value = String(Math.round((parseFloat(styleValue(el, "lineHeight")) || 16) / (parseFloat(styleValue(el, "fontSize")) || 16) * 10) || 15);
      const lhRow = row(sec2, "行高", lh);
      const lhOut = document.createElement("output"); lhOut.textContent = (parseInt(lh.value, 10) / 10).toFixed(1);
      lhRow.appendChild(lhOut);
      lh.oninput = () => { el.style.lineHeight = String(parseInt(lh.value, 10) / 10); lhOut.textContent = (parseInt(lh.value, 10) / 10).toFixed(1); remember(el); positionHandles(); };
      const weight = document.createElement("select");
      [["", "继承"], ["300", "300"], ["400", "400"], ["500", "500"], ["600", "600"], ["700", "700"], ["900", "900"]].forEach(([v, n]) => {
        const o = document.createElement("option"); o.value = v; o.textContent = n; weight.appendChild(o);
      });
      weight.value = el.style.fontWeight || "";
      row(sec2, "字重", weight);
      weight.onchange = () => { el.style.fontWeight = weight.value; remember(el); };
      const align = document.createElement("select");
      [["", "继承"], ["left", "左"], ["center", "中"], ["right", "右"], ["justify", "两端"]].forEach(([v, n]) => {
        const o = document.createElement("option"); o.value = v; o.textContent = n; align.appendChild(o);
      });
      align.value = el.style.textAlign || "";
      row(sec2, "对齐", align);
      align.onchange = () => { el.style.textAlign = align.value; remember(el); };
      const radius = document.createElement("input"); radius.type = "range"; radius.min = "0"; radius.max = "40";
      radius.value = String(parseInt(styleValue(el, "borderRadius"), 10) || 0);
      const radRow = row(sec2, "圆角", radius);
      const radOut = document.createElement("output"); radOut.textContent = radius.value + "px";
      radRow.appendChild(radOut);
      radius.oninput = () => { el.style.borderRadius = radius.value + "px"; radOut.textContent = radius.value + "px"; remember(el); };
      /* 间距 */
      const sec3 = section("间距");
      (["marginTop", "marginBottom", "padding"] as const).forEach((prop) => {
        const short = prop === "marginTop" ? "上外距" : prop === "marginBottom" ? "下外距" : "内边距";
        const inp = document.createElement("input"); inp.type = "range"; inp.min = "0"; inp.max = "80";
        inp.value = String(parseInt(styleValue(el, prop), 10) || 0);
        const r = row(sec3, short, inp);
        const out = document.createElement("output"); out.textContent = inp.value + "px";
        r.appendChild(out);
        inp.oninput = () => { (el.style as unknown as Record<string, string>)[prop] = inp.value + "px"; out.textContent = inp.value + "px"; remember(el); positionHandles(); };
      });
      /* 操作 */
      const sec4 = section("操作");
      const btns = document.createElement("div"); btns.className = "ck-ved-btns"; sec4.appendChild(btns);
      mkBtn(btns, "复制", "", () => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.removeAttribute("data-ck-ved-id");
        clone.classList.add("ck-added");
        el.parentNode?.insertBefore(clone, el.nextSibling);
        scan(); selectEl(clone); say("已复制");
      });
      mkBtn(btns, "加子元素", "primary", () => {
        const child = document.createElement("div");
        child.className = "ck-added"; child.textContent = "子元素";
        child.style.position = "relative";
        el.appendChild(child);
        scan(); selectEl(child); say("已添加子元素");
      });
      mkBtn(btns, el.style.display === "none" ? "显示" : "隐藏", "", () => {
        el.style.display = el.style.display === "none" ? "" : "none";
        renderPanel(el); positionHandles();
      });
      if (el.classList.contains("ck-added")) mkBtn(btns, "删除", "danger", () => { el.remove(); selected = null; removeHandles(); scan(); renderPanel(null); });
      /* 图层树 */
      const treeSec = document.createElement("section");
      treeSec.className = "ck-ved-sec";
      treeSec.innerHTML = "<h4>图层</h4><div id='ck-ved-tree'></div>";
      body.appendChild(treeSec);
      const tree = treeSec.querySelector("#ck-ved-tree") as HTMLElement;
      const renderTree = () => {
        tree.innerHTML = "";
        const branch = (parent: HTMLElement | null, box: HTMLElement) => {
          records.filter((r) => r.parent === parent).forEach((r) => {
            const node = document.createElement("div"); node.className = "ck-tree-node";
            const line = document.createElement("div");
            line.className = "ck-tree-line" + (selected === r.el ? " sel" : "");
            const kids = records.some((x) => x.parent === r.el);
            const tg = document.createElement("button"); tg.className = "ck-tree-tg"; tg.textContent = kids ? (r.collapsed ? "▸" : "▾") : "·";
            const nm = document.createElement("span"); nm.className = "ck-tree-name"; nm.textContent = r.name || r.kind;
            const kd = document.createElement("span"); kd.className = "ck-tree-kind"; kd.textContent = r.kind;
            line.appendChild(tg); line.appendChild(nm); line.appendChild(kd);
            node.appendChild(line); box.appendChild(node);
            line.onclick = () => selectEl(r.el);
            tg.onclick = (e) => { e.stopPropagation(); r.collapsed = !r.collapsed; renderTree(); };
            if (kids && !r.collapsed) {
              const ch = document.createElement("div"); ch.className = "ck-tree-children";
              node.appendChild(ch); branch(r.el, ch);
            }
          });
        };
        branch(null, tree);
      };
      renderTree();
    };
    const selectEl = (el: HTMLElement | null) => {
      if (!el || isProt(el)) return;
      if (selected) selected.classList.remove("ck-ved-target");
      selected = el;
      selected.classList.add("ck-ved-target");
      renderPanel(el);
      positionHandles();
    };
    const onDocClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("#ck-ved-panel,#ck-ved-handles,#ck-ved-fab,#ck-ved-guides")) return;
      /* 顶栏导航链接放行：编辑模式下点击仍可正常跳转 */
      if ((e.target as HTMLElement).closest(".ck-site-header a[href]")) return;
      const el = (e.target as HTMLElement).closest("body *") as HTMLElement | null;
      if (!el || el === document.body || isProt(el)) return;
      e.preventDefault(); e.stopPropagation();
      selectEl(el);
    };
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("pointerdown", startMove as unknown as EventListener, true);
    window.addEventListener("scroll", positionHandles, true);
    window.addEventListener("resize", positionHandles);
    document.body.classList.add("ck-ved-editing");
    /* 恢复快照 */
    const state = snapRef.current;
    (state.added || []).forEach((item) => {
      const parent = document.querySelector(item.parent);
      if (!parent || !item.html) return;
      const box = document.createElement("div");
      box.innerHTML = item.html;
      const el = box.firstElementChild as HTMLElement | null;
      if (!el) return;
      el.classList.add("ck-added");
      parent.appendChild(el);
    });
    (state.styles || []).forEach((item) => {
      let el: HTMLElement | null = null;
      try { el = document.querySelector(item.path) as HTMLElement | null; } catch { return; }
      if (!el || isProt(el)) return;
      if (item.style) el.setAttribute("style", item.style);
      if (item.hidden) el.style.display = "none";
      if (item.anim) { el.classList.add(item.anim); el.dataset.ckAnim = item.anim; }
      if (item.text !== null && item.text !== undefined) setEditableText(el, item.text);
    });
    scan();
    return () => {
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("pointerdown", startMove as unknown as EventListener, true);
      window.removeEventListener("scroll", positionHandles, true);
      window.removeEventListener("resize", positionHandles);
      document.body.classList.remove("ck-ved-editing");
      panel.remove(); handlesBox.remove(); guidesBox.remove();
      killer();
    };
    } catch (err) {
      console.error("[ck-ved] init failed:", err);
      const t = document.createElement("div");
      t.style.cssText = "position:fixed;left:16px;bottom:64px;z-index:10012;background:#b23a5a;color:#fff;padding:10px 14px;border-radius:8px;font:12px system-ui;max-width:360px";
      t.textContent = "编辑器初始化失败: " + String(err);
      document.body.appendChild(t);
      killer = () => t.remove();
    }
    })();
  }, [on, isAdmin, say, persist]);

  if (!isAdmin) return null;
  return (
    <>
      <button type="button" className={`ck-ved-fab${on ? " done" : ""}`} id="ck-ved-fab" onClick={() => setOn((v) => !v)}>
        {on ? "✓ 完成" : "✎ 编辑本页"}
      </button>
      {status && <div className="ck-ved-toast">{status}</div>}
    </>
  );
}
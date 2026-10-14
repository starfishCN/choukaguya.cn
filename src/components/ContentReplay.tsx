"use client";
/* 内容回放器：从 PageContent 读取 veditor 快照，随路由变化自动回放到当前页面。
   挂在根布局，对所有页面、所有访客生效。 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Snapshot = {
  styles: { path: string; style: string; text: string | null; hidden: boolean; anim?: string }[];
  added: { parent: string; html: string }[];
};

function setEditableText(el: HTMLElement, value: string) {
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
}

export default function ContentReplay() {
  const pathname = usePathname();
  useEffect(() => {
    let alive = true;
    const pageKey = pathname === "/" ? "home" : pathname.replace(/^\//, "").split("/")[0] || "home";
    fetch(`/api/page-content?page=${pageKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const snap: Snapshot | undefined = d.data?.veditor;
        if (!snap) return;
        requestAnimationFrame(() => {
          if (!alive) return;
          (snap.added || []).forEach((item) => {
            if (document.querySelector(`[data-ck-replay="${pageKey}"]`)) return;
            const parent = document.querySelector(item.parent);
            if (!parent || !item.html) return;
            const box = document.createElement("div");
            box.innerHTML = item.html;
            const el = box.firstElementChild as HTMLElement | null;
            if (!el) return;
            el.classList.add("ck-added");
            el.dataset.ckReplay = pageKey;
            parent.appendChild(el);
          });
          (snap.styles || []).forEach((item) => {
            let el: HTMLElement | null = null;
            try { el = document.querySelector(item.path) as HTMLElement | null; } catch { return; }
            if (!el) return;
            if (item.style) el.setAttribute("style", item.style);
            if (item.hidden) el.style.display = "none";
            if (item.anim) { el.classList.add(item.anim); el.dataset.ckAnim = item.anim; }
            if (item.text !== null && item.text !== undefined) setEditableText(el, item.text);
          });
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);
  return null;
}
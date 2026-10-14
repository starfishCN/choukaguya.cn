"use client";
import { useEffect, useState, useCallback, type CSSProperties, type ElementType } from "react";

type Texts = Record<string, string>;
type Props = {
  pageKey: string;
  fallback: Texts;
  controls?: boolean; // 是否渲染编辑开关按钮（每页只给一处）
};

// 就地编辑：管理员登录后可在页面上直接点文字修改，失焦即保存（移植自 wolf-fansite-design editor.js，升级为无面板就地编辑）
export default function EditableBlocks({ pageKey, fallback, controls }: Props) {
  const [texts, setTexts] = useState<Texts>(fallback);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const canEdit = isAdmin && editing;

  useEffect(() => {
    fetch(`/api/page-content?page=${pageKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.texts) setTexts((t) => ({ ...fallback, ...d.data.texts }));
      })
      .catch(() => {});
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.user && (d.user.role === "ADMIN" || d.user.role === "OWNER")))
      .catch(() => {});
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "1")
      setEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target as HTMLElement)?.isContentEditable) setEditing(false);
    };
    document.body.classList.add("ck-editing-on");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("ck-editing-on");
      window.removeEventListener("keydown", onKey);
    };
  }, [editing]);

  const saveKey = useCallback(
    async (key: string, value: string) => {
      const merged = { ...texts, [key]: value };
      setTexts(merged);
      try {
        const res = await fetch("/api/page-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageKey, data: { texts: merged } }),
        });
        setStatus(res.ok ? "已保存" : "保存失败：请重新登录");
      } catch {
        setStatus("保存失败：网络错误");
      }
      setTimeout(() => setStatus(""), 2500);
    },
    [texts, pageKey]
  );

  // 可编辑文字：非编辑态纯渲染；编辑态就地打字，失焦保存
  const T = ({
    k,
    tag = "span",
    className,
    style,
  }: {
    k: string;
    tag?: ElementType;
    className?: string;
    style?: CSSProperties;
  }) => {
    const Tag = tag as ElementType;
    const val = texts[k] ?? fallback[k] ?? "";
    if (!canEdit) return <Tag className={className} style={style}>{val}</Tag>;
    return (
      <Tag
        key={`${k}:${val}`}
        className={className}
        style={style}
        contentEditable
        suppressContentEditableWarning
        data-editing="1"
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const v = e.currentTarget.innerText.replace(/\n{3,}/g, "\n\n").trim();
          if (v && v !== val) saveKey(k, v);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          e.stopPropagation();
          if (e.key === "Enter" && !(e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
          if (e.key === "Escape") (e.target as HTMLElement).blur();
        }}
      >
        {val}
      </Tag>
    );
  };

  const noticeText = texts["notice.text"] ?? fallback["notice.text"] ?? "";

  return (
    <>
      {canEdit && !noticeText && <T k="notice.text" tag="p" className="ck-inline-edit-notice-placeholder" />}

      {noticeText && (
        <T
          k="notice.text"
          tag="p"
          style={{
            padding: "10px 14px",
            background: "#f7edf1",
            borderRadius: "8px",
            color: "#7a4a5c",
            fontSize: "14px",
            margin: "0 0 14px",
          }}
        />
      )}

      <div className="ck-home-intro">
        <T k="intro.kicker" />
        <T k="intro.title" tag="h2" />
        <T k="intro.sub" tag="p" />
      </div>

      <div className="ck-section-heading">
        <div>
          <T k="latest.kicker" tag="span" className="ck-section-kicker" />
          <T k="latest.title" tag="h2" className="ck-section-title" />
        </div>
        <T k="latest.note" tag="span" className="ck-section-note" />
      </div>
    </>
  );
}
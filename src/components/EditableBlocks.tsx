"use client";
import { useEffect, useState } from "react";

type Slot = { kicker?: string; title?: string; sub?: string; note?: string };
type Props = {
  pageKey: string;
  slots: string[];
  fallback: Record<string, Slot>;
};

// 从 PageContent 表读 Puck 数据，渲染 intro / latest 两个槽位；无数据时用 fallback
export default function EditableBlocks({ pageKey, slots, fallback }: Props) {
  const [map, setMap] = useState<Record<string, Slot>>(fallback);
  useEffect(() => {
    fetch(`/api/page-content?page=${pageKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.data?.content) return;
        const m: Record<string, Slot> = { ...fallback };
        for (const item of d.data.content) {
          const p = item.props ?? {};
          if (item.type === "HeroTitle" && !m.intro_edited) {
            m.intro = { kicker: p.kicker ?? m.intro?.kicker, title: p.text ?? m.intro?.title, sub: m.intro?.sub };
          } else if (item.type === "SectionHeading") {
            m.latest = { kicker: p.kicker ?? m.latest?.kicker, title: p.title ?? m.latest?.title, note: p.note ?? m.latest?.note };
          } else if (item.type === "Notice") {
            m.notice = { title: p.text ?? "" };
          }
        }
        setMap(m);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  return (
    <>
      {slots.includes("intro") && (
        <div className="ck-home-intro">
          <span>{map.intro?.kicker}</span>
          <h2>{map.intro?.title}</h2>
          {map.intro?.sub && <p>{map.intro.sub}</p>}
        </div>
      )}
      {slots.includes("latest") && (
        <div className="ck-section-heading">
          <div>
            <span className="ck-section-kicker">{map.latest?.kicker}</span>
            <h2 className="ck-section-title">{map.latest?.title}</h2>
          </div>
          <span className="ck-section-note">{map.latest?.note}</span>
        </div>
      )}
      {slots.includes("notice") && map.notice?.title && (
        <p style={{ padding: "10px 14px", background: "#f7edf1", borderRadius: "8px", color: "#7a4a5c", fontSize: "14px", margin: "0 0 14px" }}>
          {map.notice.title}
        </p>
      )}
    </>
  );
}

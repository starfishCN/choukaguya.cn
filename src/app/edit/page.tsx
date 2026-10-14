"use client";
import { useEffect, useState } from "react";
import { Puck, Render, type Data } from "@puckeditor/core";
import Link from "next/link";

// 可编辑的区块：只有这几样，保持首页结构稳定
const config = {
  components: {
    HeroTitle: {
      fields: { text: { type: "text" }, kicker: { type: "text" } },
      render: ({ text, kicker }: any) => (
        <div className="ck-home-intro">
          <span>{kicker}</span>
          <h2>{text}</h2>
        </div>
      ),
    },
    Notice: {
      fields: { text: { type: "text" } },
      render: ({ text }: any) => <p className="ck-notice" style={{padding:"10px 14px",background:"#f7edf1",borderRadius:"8px",color:"#7a4a5c",fontSize:"14px",display: text ? undefined : "none"}}>{text ?? ""}</p>,
    },
    SectionHeading: {
      fields: { kicker: { type: "text" }, title: { type: "text" }, note: { type: "text" } },
      render: ({ kicker, title, note }: any) => (
        <div className="ck-section-heading">
          <div><span className="ck-section-kicker">{kicker}</span><h2 className="ck-section-title">{title}</h2></div>
          <span className="ck-section-note">{note}</span>
        </div>
      ),
    },
  },
};

export default function EditPage() {
  const [data, setData] = useState<Data | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch("/api/page-content?page=home").then(r=>r.json()).then(d=>setData(d.data ?? { content: [] }));
  }, []);
  if (!data) return <p style={{padding:40}}>加载中…</p>;
  return (
    <div style={{height:"100vh"}}>
      <div style={{padding:"10px 16px",display:"flex",gap:12,alignItems:"center",borderBottom:"1px solid #eee"}}>
        <Link href="/">← 返回首页</Link>
        <strong>Puck 页面编辑器</strong>
        {saved && <span style={{color:"#2e8b57"}}>已保存</span>}
      </div>
      <Puck
        config={config}
        data={data}
        onPublish={async (d: Data) => {
          const r = await fetch("/api/page-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageKey: "home", data: d }),
          });
          if (r.ok) { setSaved(true); setTimeout(()=>setSaved(false), 2000); }
        }}
      />
    </div>
  );
}

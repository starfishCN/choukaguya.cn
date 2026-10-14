"use client";
import { useEffect, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import Link from "next/link";

// 可编辑的区块：只有这几样，保持首页结构稳定
const config = {
  components: {
    HeroTitle: {
      fields: {
        kicker: { type: "text", label: "顶部小字" },
        text: { type: "text", label: "大标题" },
      },
      render: ({ text, kicker }: any) => (
        <div className="ck-home-intro">
          <span>{kicker}</span>
          <h2>{text}</h2>
        </div>
      ),
      label: "首页标题",
    },
    Notice: {
      fields: { text: { type: "text", label: "公告文字" } },
      render: ({ text }: any) => (
        <p className="ck-notice" style={{ padding: "10px 14px", background: "#f7edf1", borderRadius: "8px", color: "#7a4a5c", fontSize: "14px", display: text ? undefined : "none" }}>{text ?? ""}</p>
      ),
      label: "公告条",
    },
    SectionHeading: {
      fields: {
        kicker: { type: "text", label: "区块小字" },
        title: { type: "text", label: "区块标题" },
        note: { type: "text", label: "右侧备注" },
      },
      render: ({ kicker, title, note }: any) => (
        <div className="ck-section-heading">
          <div><span className="ck-section-kicker">{kicker}</span><h2 className="ck-section-title">{title}</h2></div>
          <span className="ck-section-note">{note}</span>
        </div>
      ),
      label: "区块标题",
    },
  },
};

// 界面汉化（Puck dictionary）
const zh: Record<string, string> = {
  "header-publish": "发布",
  "header-undo": "撤销",
  "header-redo": "重做",
  "header-toggle-leftsidebar": "展开/收起左侧栏",
  "header-toggle-rightsidebar": "展开/收起右侧栏",
  "header-toggle-menubar": "展开/收起菜单",
  "action-selectparent": "选中上级",
  "action-duplicate": "复制",
  "action-delete": "删除",
  "label-page": "页面",
  "label-component": "组件",
  "outline-empty": "暂无内容",
  "outline-item-collapse": "收起",
  "outline-item-expand": "展开",
  "outline-header-title": "大纲",
  "outline-header-collapseall": "全部收起",
  "outline-item-duplicate": "复制",
  "outline-item-delete": "删除",
  "drawer-category-collapse": "收起 {title}",
  "drawer-category-expand": "展开 {title}",
  "drawer-category-other": "其他",
  "canvas-noconfig": "没有配置：{type}",
  "field-readonly": "只读",
  "viewport-zoom-auto": "{zoom}%（自动）",
  "plugin-blocks": "内容块",
  "plugin-outline": "大纲",
  "plugin-fields": "属性",
  "plugin-components": "组件",
  "layout-maximize": "最大化",
  "layout-minimize": "最小化",
  "loader-loading": "加载中",
};

// 预置的默认页面：打开就是首页的三块内容，直接点改
const defaultData: Data = {
  content: [
    { type: "HeroTitle", props: { kicker: "COSMIC PRINCESS KAGUYA!", text: "把散落的星光，收进月读。", id: "HeroTitle-1" } },
    { type: "SectionHeading", props: { kicker: "LATEST WORKS", title: "最近收录", note: "按标签寻找同频创作", id: "SectionHeading-1" } },
  ],
  root: { title: "首页" },
  ui: { }
} as Data;

export default function EditPage() {
  const [data, setData] = useState<Data | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch("/api/page-content?page=home")
      .then((r) => r.json())
      .then((d) => setData(d.data ?? defaultData));
  }, []);
  if (!data) return <p style={{ padding: 40 }}>加载中…</p>;
  return (
    <div style={{ height: "100vh" }}>
      <div style={{ padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #eee" }}>
        <Link href="/">← 返回首页</Link>
        <strong>页面编辑器</strong>
        <span style={{ color: "#888", fontSize: 13 }}>拖左边「内容块」进中间画布，点画布里的块在右边改文字，改完点「发布」</span>
        {saved && <span style={{ color: "#2e8b57" }}>已保存</span>}
      </div>
      <Puck
        config={config}
        data={data}
        dictionary={zh}
        headerTitle={"首页编辑"}
        onPublish={async (d: Data) => {
          const r = await fetch("/api/page-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageKey: "home", data: d }),
          });
          if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
        }}
      />
    </div>
  );
}

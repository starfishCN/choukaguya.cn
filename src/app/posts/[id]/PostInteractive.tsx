"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  content: string;
  author: { name: string };
  createdAt: string;
  replies?: Comment[];
};

export default function PostInteractive({
  postId,
  initialLikes,
  initialFavs,
}: {
  postId: string;
  initialLikes: number;
  initialFavs: number;
}) {
  const r = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [favs, setFavs] = useState(initialFavs);
  const [likeActive, setLikeActive] = useState(false);
  const [favActive, setFavActive] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  }, [postId]);

  const submitComment = async () => {
    if (!text.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: text, parentId: replyTo }),
    });
    if (res.ok) {
      setText(""); setReplyTo(null); setErr("");
      const d = await fetch(`/api/comments?postId=${postId}`).then((r) => r.json());
      setComments(d.comments ?? []);
    } else if (res.status === 401) {
      r.push("/login");
    } else setErr("发送失败");
  };

  const react = async (kind: "like" | "favorite") => {
    const res = await fetch("/api/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, kind }),
    });
    if (res.status === 401) { r.push("/login"); return; }
    const d = await res.json();
    if (kind === "like") { setLikes(d.count); setLikeActive(d.active); }
    else { setFavs(d.count); setFavActive(d.active); }
  };

  const renderComment = (c: Comment, depth = 0) => (
    <div key={c.id} style={{ marginLeft: depth * 16 }} className="mt-3">
      <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(13,18,32,.5)", border: "1px solid var(--ck-line)" }}>
        <span className="font-medium" style={{ color: "var(--ck-accent)" }}>{c.author.name}</span>
        <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
        <button className="mt-1 text-xs" style={{ color: "var(--ck-text-dim)" }}
          onClick={() => setReplyTo(c.id)}>回复</button>
      </div>
      {c.replies?.map((rc) => renderComment(rc, depth + 1))}
    </div>
  );

  return (
    <>
      <div className="mt-4 flex gap-2">
        <button className={likeActive ? "ck-btn" : "ck-btn-ghost"} onClick={() => react("like")}>
          赞 {likes}
        </button>
        <button className={favActive ? "ck-btn" : "ck-btn-ghost"} onClick={() => react("favorite")}>
          收藏 {favs}
        </button>
      </div>

      <section className="ck-panel mt-4 p-5">
        <h2 className="font-bold">评论（{comments.length}）</h2>
        <div className="mt-3 flex flex-col gap-2">
          {replyTo && (
            <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>
              正在回复某条评论
              <button className="ml-2 underline" onClick={() => setReplyTo(null)}>取消</button>
            </p>
          )}
          <textarea
            className="ck-input"
            rows={2}
            placeholder="写下你的评论……"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {err && <p className="text-sm" style={{ color: "var(--ck-danger)" }}>{err}</p>}
          <button className="ck-btn self-end" onClick={submitComment}>发送</button>
        </div>
        {comments.map((c) => renderComment(c))}
        {comments.length === 0 && (
          <p className="mt-3 text-sm" style={{ color: "var(--ck-text-dim)" }}>还没有评论。</p>
        )}
      </section>
    </>
  );
}
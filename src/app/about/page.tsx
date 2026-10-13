import Link from "next/link";

export const metadata = {
  title: "关于本站 · 超时空辉夜姬同人收集站",
};

export default function About() {
  return (
    <main className="relative z-10 mx-auto max-w-2xl px-4 py-10">
      <p className="mb-6 text-sm">
        <Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>← 返回广场</Link>
      </p>
      <h1 className="ck-title mb-6 text-2xl font-bold">关于本站</h1>

      <section className="ck-panel p-6">
        <h2 className="mb-3 text-lg font-bold">这是什么</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ck-text-dim)" }}>
          choukaguya.cn 是一个面向《超时空辉夜姬！》（超かぐや姫！／Cosmic Princess Kaguya!）爱好者的
          非官方同人作品收集站。以「tag 检索型作品广场」为核心：收录同人图、同人文、视频与音乐，
          支持标签检索、自动补全、评论互动与投稿。
        </p>
      </section>

      <section className="ck-panel mt-4 p-6" style={{ borderColor: "rgba(255,227,143,.35)" }}>
        <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--ck-gold)" }}>非官方声明</h2>
        <p className="text-sm leading-relaxed">
          本站为非官方粉丝同人站点，与《超时空辉夜姬！》的官方及其关联方无任何关系。
          站内展示的所有角色、作品名称及相关素材的著作权归原权利人所有。
          本站不主张对上述内容的任何权利。
        </p>
      </section>

      <section className="ck-panel mt-4 p-6">
        <h2 className="mb-3 text-lg font-bold">内容与授权</h2>
        <ul className="list-disc pl-5 text-sm leading-relaxed" style={{ color: "var(--ck-text-dim)" }}>
          <li>本站采用收录制：由投稿者或管理员整理上传，会注明原作者与出处。</li>
          <li>欢迎原作者投稿自己的作品；若作品被收录而您不希望展示，请联系我们，将立即移除。</li>
          <li>本站不使用官方插画作为装饰素材，视觉效果均为自主设计。</li>
        </ul>
      </section>

      <section className="ck-panel mt-4 p-6">
        <h2 className="mb-3 text-lg font-bold">社区规则</h2>
        <ul className="list-disc pl-5 text-sm leading-relaxed" style={{ color: "var(--ck-text-dim)" }}>
          <li>禁止发布违法违规、侵权、人身攻击、广告垃圾内容。</li>
          <li>投稿请勿冒用他人身份；收录他人作品请注明原作者与出处。</li>
          <li>发现违规内容可用举报功能反馈，管理员会尽快处理。</li>
        </ul>
      </section>

      <section className="ck-panel mt-4 p-6">
        <h2 className="mb-3 text-lg font-bold">联系</h2>
        <p className="text-sm" style={{ color: "var(--ck-text-dim)" }}>
          站长联系方式与举报渠道将在后续补充。
        </p>
      </section>

      <footer className="mt-10 text-center text-xs" style={{ color: "var(--ck-text-dim)" }}>
        本站为非官方粉丝同人站，与官方无关。相关角色与作品著作权归原权利人所有。
      </footer>
    </main>
  );
}
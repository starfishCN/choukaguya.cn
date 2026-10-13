import Link from "next/link";
import { notFound } from "next/navigation";

type Policy = {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

const policies: Record<string, Policy> = {
  copyright: {
    title: "版权与收录声明",
    updated: "2026-10-13",
    intro: "本站是非官方同人数字档案馆，不代表《超时空辉夜姬！》官方或任何权利人。本站不主张对第三方作品、角色、名称和原始素材拥有权利。",
    sections: [
      { heading: "收录来源", body: ["作品可能来自作者本人投稿、作者明确授权的收录、社区推荐或公开整理。来源不等于授权，页面会逐步记录原作者、出处、授权状态和允许范围。", "未完成权利确认的内容不应被表述为已授权。发现来源或授权信息错误，请通过下架投诉渠道联系。"] },
      { heading: "使用限制", body: ["除作品作者或其他权利人另行声明外，本站仅提供站内展示和检索。下载、转载、改编、商业使用和再分发须取得相应权利人的许可。", "本站不会将用户投稿出售、授权给第三方训练模型，或以赞助、会员等方式解锁普通作品的版权内容。"] },
      { heading: "权利人请求", body: ["权利人可以提交作品链接、权利证明、联系方式和具体请求。收到明确且可核验的请求后，本站会先隐藏相关内容，再进行核验和后续处理。", "本站会保留必要的处理记录，但不会公开投诉人的邮箱、证件或其他私人信息。"] },
    ],
  },
  submission: {
    title: "投稿规则",
    updated: "2026-10-13",
    intro: "投稿前请确认你有权上传内容，或已获得足以支持本站展示的明确授权。投稿者对提交内容及填写信息的真实性负责。",
    sections: [
      { heading: "可以投稿", body: ["原创同人图、同人文、视频、音乐及其他与本站主题相关的作品；也可以提交经过作者许可的收录条目。", "请填写标题、作者、出处、语言、类型、标签和内容警告。转载作品必须标明原作者与来源链接，不得把转载者写成作者。"] },
      { heading: "禁止内容", body: ["禁止未经许可的批量转载、冒用作者身份、盗用他人署名、恶意营销、违法内容、骚扰和人身攻击。", "禁止上传含有恶意代码、追踪器、侵犯隐私的文件，或绕过本站大小、格式和安全限制的内容。"] },
      { heading: "审核与处理", body: ["本站可能对投稿进行补充信息、修改标签、限制展示或暂缓发布。高风险内容会先审核；普通投稿也可能进入待观察状态。", "作者可以申请修改、导出或下架自己的作品。现阶段部分请求需要管理员人工处理，相关审计和自助功能会逐步补齐。"] },
    ],
  },
  takedown: {
    title: "下架与投诉",
    updated: "2026-10-13",
    intro: "发现侵权、隐私泄露、冒名投稿或其他需要处理的内容，请提交具体链接和理由。清晰、可核验的请求会优先处理。",
    sections: [
      { heading: "请求应包含", body: ["被投诉作品的完整页面链接或作品 ID；涉及的具体图片、文字或文件；投诉理由；你的姓名或称呼、有效联系方式。", "版权投诉请补充权利人身份、权利依据或原始发布链接，并说明希望采取的措施。代权利人投诉时，请说明代理关系。"] },
      { heading: "处理流程", body: ["本站收到明确投诉后，通常先将争议内容隐藏，避免在核验期间继续公开传播。管理员会核对来源、授权和双方提供的材料。", "目标是自收到完整请求起 72 小时内回应是否受理；复杂案件可能需要补充材料。处理结果包括恢复、修改标注、限制访问或下架。"] },
      { heading: "误报与复核", body: ["举报不等于侵权成立。被投诉者可以提供授权证明或其他说明，管理员会记录复核结果。恶意、重复或伪造投诉可能被限制提交权限。", "投诉邮箱尚未接入独立表单。当前请使用站内举报功能，并在作品页面中说明具体问题；正式邮箱渠道将在上线后更新。"] },
    ],
  },
  privacy: {
    title: "隐私政策",
    updated: "2026-10-13",
    intro: "本站只收集提供账号、投稿、互动、安全和投诉处理所必需的信息，尽量减少个人数据的收集与留存。",
    sections: [
      { heading: "收集的信息", body: ["注册时保存邮箱、昵称和加密后的密码摘要；投稿、评论、点赞、收藏和举报会关联账号及相应操作记录。", "服务器可能记录访问时间、请求地址和错误日志，用于安全防护、故障排查和防滥用。本站不会把这些信息用于出售或定向广告。"] },
      { heading: "使用与保存", body: ["数据仅用于账号登录、作品展示、社区互动、审核、举报处理、备份和安全维护。公开页面不会显示邮箱、密码摘要、举报人联系方式或私信内容。", "用户可以申请更正账号信息、导出与自己相关的数据或删除账号。法律、版权争议和安全审计所需的最小记录可能按必要期限保留。"] },
      { heading: "第三方与安全", body: ["本站使用服务器、数据库和 HTTPS 提供服务。作品文件可能由本站的文件存储服务提供，不向无关第三方出售用户数据。", "不存在绝对安全的网络服务。若发现账号异常、隐私泄露或错误公开，请立即通过投诉渠道报告。"] },
    ],
  },
  terms: {
    title: "用户协议",
    updated: "2026-10-13",
    intro: "注册、投稿、评论或使用本站功能，即表示你已阅读并同意遵守本协议、投稿规则、版权声明和内容分级说明。",
    sections: [
      { heading: "账号与行为", body: ["用户应提供真实、可联系的信息，不得出借、转让或冒用账号。你对账号下发起的投稿、评论、举报和其他操作负责。", "不得利用本站实施侵权、骚扰、欺诈、恶意刷量、绕过访问限制或影响服务稳定性的行为。"] },
      { heading: "投稿授权", body: ["你保留对自己作品的权利。投稿表示你授予本站在约定范围内保存、生成缩略图、展示和提供检索的非独占许可；不表示本站取得作品所有权。", "未经明确授权，本站不会把投稿内容用于商业售卖、训练数据集或超出站内服务所需的再分发。"] },
      { heading: "管理措施", body: ["对违反规则、存在侵权风险或安全风险的内容，本站可以隐藏、限制访问、修改分类、删除或暂停相关账号。处理会尽量说明理由，并保留必要的审计记录。", "服务可能因维护、故障、法律要求或资源限制而中断。本站不承诺永久在线，也不以当前服务替代作者自己的备份。"] },
    ],
  },
  rating: {
    title: "内容分级说明",
    updated: "2026-10-13",
    intro: "分级用于帮助访问者判断内容是否适合当前场景。分级不是对作品价值的评价，也不能替代法律规定或监护人的判断。",
    sections: [
      { heading: "分级标准", body: ["G：一般内容，无明显成人或强烈刺激元素。T13：可能包含轻度恋爱、冲突、惊吓或适合青少年判断的内容。", "T16：可能包含较强情绪、暧昧性内容、暴力暗示或复杂主题。R18：仅限成年人查看，可能包含明确成人主题。Restricted：权利、隐私或安全状态未确认，默认不公开。"] },
      { heading: "展示原则", body: ["投稿者应主动填写内容警告。无法确认时按更保守的级别处理；管理员可以调整分级或暂缓展示。", "限制级内容应默认隐藏，未成年人不得访问。当前站点的完整年龄确认、分级拦截和 API 层强制校验仍在开发，现阶段请勿投稿明确的 R18 内容。"] },
      { heading: "报告错误", body: ["若内容分级、警告或缩略图暴露了不适合公开的信息，请使用站内举报并说明具体位置。本站会优先隐藏高风险内容，再进行核验。"] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 py-10">
      <p className="mb-6 text-sm"><Link href="/about" className="underline" style={{ color: "var(--ck-accent)" }}>← 返回关于本站</Link></p>
      <header className="mb-6">
        <p className="mb-2 text-xs uppercase tracking-[.22em]" style={{ color: "var(--ck-gold)" }}>SITE POLICY</p>
        <h1 className="ck-title text-3xl font-bold">{policy.title}</h1>
        <p className="mt-2 text-xs" style={{ color: "var(--ck-text-dim)" }}>更新日期：{policy.updated}</p>
      </header>
      <section className="ck-panel p-6 md:p-8">
        <p className="border-b pb-6 text-sm leading-7" style={{ borderColor: "var(--ck-line)" }}>{policy.intro}</p>
        {policy.sections.map((section) => (
          <section key={section.heading} className="border-b py-6 last:border-b-0 last:pb-0" style={{ borderColor: "var(--ck-line)" }}>
            <h2 className="mb-3 text-lg font-bold">{section.heading}</h2>
            {section.body.map((paragraph) => <p key={paragraph} className="mb-3 text-sm leading-7 last:mb-0" style={{ color: "var(--ck-text-dim)" }}>{paragraph}</p>)}
          </section>
        ))}
      </section>
      <p className="mt-6 text-center text-xs" style={{ color: "var(--ck-text-dim)" }}>本页面为站点运营规则，不构成法律意见。</p>
    </main>
  );
}

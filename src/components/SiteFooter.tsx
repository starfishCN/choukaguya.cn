import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";

export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="ck-site-footer">
      <div>
        <strong>TSUKUYOMI</strong>
        <span>{t.footer}</span>
      </div>
      <nav aria-label="站点制度">
        <Link href="/policies/copyright">版权</Link>
        <Link href="/policies/submission">投稿</Link>
        <Link href="/policies/takedown">投诉</Link>
        <Link href="/policies/privacy">隐私</Link>
      </nav>
    </footer>
  );
}

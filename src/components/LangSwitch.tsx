"use client";
import { useI18n } from "@/lib/I18nProvider";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";

export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-1 text-xs">
      {LOCALES.map((l) => (
        <button key={l}
          onClick={() => setLocale(l as Locale)}
          className={l === locale ? "ck-btn px-2 py-1" : "ck-btn-ghost px-2 py-1"}>
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
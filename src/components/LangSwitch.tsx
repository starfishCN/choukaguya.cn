"use client";
import { useI18n } from "@/lib/I18nProvider";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";

export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <label className="ck-lang-select">
      <span className="sr-only">语言</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label="语言">
        {LOCALES.map((l) => <option key={l} value={l}>{LOCALE_NAMES[l]}</option>)}
      </select>
    </label>
  );
}
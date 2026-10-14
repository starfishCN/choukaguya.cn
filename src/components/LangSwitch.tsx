"use client";
import { useI18n } from "@/lib/I18nProvider";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n";
import { useState } from "react";
export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="ck-lang-drop">
      <button
        className="ck-lang-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="语言"
      >
        {LOCALE_NAMES[locale]}<span className="ck-lang-caret">▾</span>
      </button>
      {open && (
        <ul className="ck-lang-menu" role="listbox">
          {LOCALES.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                className={"ck-lang-item" + (l === locale ? " ck-lang-active" : "")}
                onClick={() => { setLocale(l as Locale); setOpen(false); }}
              >{LOCALE_NAMES[l]}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

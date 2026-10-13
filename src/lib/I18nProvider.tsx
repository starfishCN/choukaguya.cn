"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { dict, type Locale, type Dict, LOCALES } from "@/lib/i18n";

const Ctx = createContext<{ locale: Locale; t: Dict; setLocale: (l: Locale) => void }>({
  locale: "zh",
  t: dict.zh as Dict,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = document.cookie.match(/ck_locale=(zh|ja|en)/)?.[1] as Locale | undefined;
    if (saved && LOCALES.includes(saved)) setLocaleState(saved);
    else {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("ja")) setLocaleState("ja");
      else if (nav.startsWith("zh")) setLocaleState("zh");
      else setLocaleState("en");
    }
  }, []);

  const setLocale = (l: Locale) => {
    document.cookie = `ck_locale=${l}; path=/; max-age=31536000`;
    setLocaleState(l);
  };

  return <Ctx.Provider value={{ locale, t: dict[locale] as Dict, setLocale }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
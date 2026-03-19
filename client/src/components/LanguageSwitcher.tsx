"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  en: "EN",
  vi: "VI",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 p-0.5 dark:border-white/20 border-zinc-300">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            locale === loc
              ? "bg-white text-zinc-900 dark:bg-white dark:text-zinc-900"
              : "text-zinc-400 hover:text-white dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}

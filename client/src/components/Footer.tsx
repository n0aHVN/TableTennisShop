"use client";

import { useTranslations } from "next-intl";

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.498 1.434 6.522 3.769 8.61a.947.947 0 0 1 .32.676l.065 2.11a.95.95 0 0 0 1.333.845l2.353-1.04a.95.95 0 0 1 .636-.053c1.12.31 2.313.478 3.524.478 6.76 0 12-4.952 12-11.64S18.76.024 12 .024zm1.186 15.676l-3.058-3.263-5.964 3.263 6.559-6.963 3.133 3.263 5.889-3.263-6.559 6.963z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const FACEBOOK_URL = "https://facebook.com/tableTennisShop";
const MESSENGER_URL = "https://m.me/tableTennisShop";
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.69892767479686!3d10.778789089369444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1d95ca0e95a4679c!2zQuG6v24gTmjDoCBUaMOgbmggUGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About Us */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {t("aboutTitle")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("aboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {t("linksTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              {(["shop", "about", "contact"] as const).map((key) => (
                <li key={key}>
                  <a
                    href={`#${key}`}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {t("connectTitle")}
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10">
                  <FacebookIcon />
                </span>
                Facebook
              </a>
              <a
                href={MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10">
                  <MessengerIcon />
                </span>
                Messenger
              </a>
            </div>
          </div>

          {/* Google Maps */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {t("visitTitle")}
            </h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10">
              <iframe
                src={MAP_EMBED_URL}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store location"
              />
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
              <span className="mt-0.5 flex-shrink-0">
                <MapPinIcon />
              </span>
              {t("address")}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("copyright", { year })}
          </p>
          <a
            href="/"
            className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            TableTennis
          </a>
        </div>
      </div>
    </footer>
  );
}

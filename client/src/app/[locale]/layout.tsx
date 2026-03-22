import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SmoothScroll } from "@/components/SmoothScroll";

import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "TableTennis Shop | Premium Equipment",
  description:
    "Premium table tennis equipment for players who demand the best.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "vi")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem("theme");if(d){var t=JSON.parse(d).state.theme;if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

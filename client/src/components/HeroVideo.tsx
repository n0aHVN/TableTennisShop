"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { proxiedMediaPath } from "@/lib/media-url";

function heroVideoSrc(): string {
  const fullOverride = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;
  if (fullOverride) return fullOverride;
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? "landing";
  const objectKey =
    process.env.NEXT_PUBLIC_HERO_VIDEO_OBJECT_KEY ?? "FocusWithin.mp4";

  const path = proxiedMediaPath(bucket, objectKey);
  return path;
}

export function HeroVideo() {
  const t = useTranslations("hero");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={heroVideoSrc()} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-xl text-lg text-zinc-200 sm:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.a
          href="#shop"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95"
        >
          {t("cta")}
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}

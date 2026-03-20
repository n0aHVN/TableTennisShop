"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import { useLocale } from "next-intl";
import flagshipData from "../../data/flagship.json";

type LocaleKey = "en" | "vi";

interface FlagshipProduct {
  id: string;
  category: Record<LocaleKey, string>;
  name: Record<LocaleKey, string>;
  description: Record<LocaleKey, string>;
  price: string;
  image: string;
  badge: Record<LocaleKey, string>;
  link: string;
}

const data = flagshipData as {
  sectionTitle: Record<LocaleKey, string>;
  sectionSubtitle: Record<LocaleKey, string>;
  products: FlagshipProduct[];
};

const PLACEHOLDER_GRADIENTS = [
  "from-rose-500/20 to-orange-500/20",
  "from-blue-500/20 to-cyan-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-violet-500/20 to-purple-500/20",
  "from-amber-500/20 to-yellow-500/20",
];

function ProductCard({
  product,
  locale,
  index,
  isActive,
}: {
  product: FlagshipProduct;
  locale: LocaleKey;
  index: number;
  isActive: boolean;
}) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];

  return (
    <motion.div
      className="relative flex h-full w-full flex-shrink-0 items-center justify-center px-4 sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div
          className={`relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} border border-zinc-200 dark:border-white/10`}
        >
          <img
            src={product.image}
            alt={product.name[locale]}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute top-4 left-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-100">
              {product.badge[locale]}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {product.category[locale]}
          </span>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            {product.name[locale]}
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description[locale]}
          </p>
          <p className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            {product.price}
          </p>
          <a
            href={product.link}
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-700 hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {locale === "vi" ? "Xem Sản Phẩm" : "View Product"}
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
          </a>
        </div>
      </div>
    </motion.div>
  );
}

const SCROLL_COOLDOWN = 800;

export function FlagshipSection() {
  const locale = useLocale() as LocaleKey;
  const products = data.products;
  const totalCards = products.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastScrollTime = useRef(0);

  const xPercent = useMotionValue(0);

  const goToCard = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalCards - 1));
      if (clamped === activeIndexRef.current) return;

      isAnimatingRef.current = true;
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);

      animate(xPercent, -clamped * 100, {
        type: "tween",
        ease: [0.32, 0.72, 0, 1],
        duration: 0.6,
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    },
    [totalCards, xPercent]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      const sectionVisible =
        rect.top <= 0 && rect.bottom >= window.innerHeight;

      if (!sectionVisible) return;

      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) {
        e.preventDefault();
        return;
      }
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;

      if (nextIndex < 0 || nextIndex >= totalCards) return;

      e.preventDefault();
      lastScrollTime.current = now;
      goToCard(nextIndex);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimatingRef.current) return;
      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        const next = activeIndexRef.current + 1;
        if (next < totalCards) {
          lastScrollTime.current = now;
          goToCard(next);
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        const prev = activeIndexRef.current - 1;
        if (prev >= 0) {
          lastScrollTime.current = now;
          goToCard(prev);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      const sectionVisible =
        rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!sectionVisible) return;

      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;
      if (isAnimatingRef.current) return;

      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 30) return;

      const direction = deltaY > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;
      if (nextIndex < 0 || nextIndex >= totalCards) return;

      lastScrollTime.current = now;
      goToCard(nextIndex);
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    section.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [totalCards, goToCard]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${totalCards * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-24 pb-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            {data.sectionTitle[locale]}
          </h2>
          <p className="mt-3 max-w-lg text-lg text-zinc-500 dark:text-zinc-400">
            {data.sectionSubtitle[locale]}
          </p>
        </div>

        <div className="relative flex-1">
          <motion.div
            className="absolute inset-0 flex"
            style={{ x: useTransformPercent(xPercent) }}
          >
            {products.map((product, i) => (
              <div key={product.id} className="h-full w-full flex-shrink-0">
                <ProductCard
                  product={product}
                  locale={locale}
                  index={i}
                  isActive={i === activeIndex}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-8">
          {products.map((product, i) => (
            <button
              key={product.id}
              onClick={() => goToCard(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-zinc-900 dark:bg-white"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function useTransformPercent(motionValue: ReturnType<typeof useMotionValue<number>>) {
  const output = useMotionValue("0%");
  useEffect(() => {
    const unsubscribe = motionValue.on("change", (v) => {
      output.set(`${v}%`);
    });
    return unsubscribe;
  }, [motionValue, output]);
  return output;
}

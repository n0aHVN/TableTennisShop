"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import { useLocale } from "next-intl";
import flagshipData from "../../data/flagship.json";

type LocaleKey = "en" | "vi";

interface FlagshipProduct {
  id: string;
  category: string;
  image: string;
  href: string;
}

const products = flagshipData as FlagshipProduct[];

const PLACEHOLDER_GRADIENTS = [
  "from-rose-500/20 to-orange-500/20",
  "from-blue-500/20 to-cyan-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-violet-500/20 to-purple-500/20",
  "from-amber-500/20 to-yellow-500/20",
];

function ProductCard({
  product,
  index,
  isActive,
}: {
  product: FlagshipProduct;
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
      <a
        href={product.href}
        className={`relative block aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} border border-zinc-200 transition-transform hover:scale-[1.02] dark:border-white/10`}
      >
        <img
          src={product.image}
          alt={product.category}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold capitalize text-zinc-900 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-100">
            {product.category}
          </span>
        </div>
      </a>
    </motion.div>
  );
}

const AUTO_PLAY_INTERVAL = 5000;

export function FlagshipSection() {
  const locale = useLocale() as LocaleKey;
  const totalCards = products.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const xPercent = useMotionValue(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const goToCard = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalCards - 1));
      setActiveIndex(clamped);
      animate(xPercent, -clamped * 100, {
        type: "tween",
        ease: [0.32, 0.72, 0, 1],
        duration: 0.6,
      });
    },
    [totalCards, xPercent]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % totalCards;
        animate(xPercent, -next * 100, {
          type: "tween",
          ease: [0.32, 0.72, 0, 1],
          duration: 0.6,
        });
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [totalCards, xPercent]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleDotClick = (index: number) => {
    goToCard(index);
    resetTimer();
  };

  return (
    <section className="relative">
      <div className="flex flex-col overflow-hidden py-16 sm:py-24">
        <div className="flex flex-col items-center px-6 pb-10 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            {locale === "vi" ? "Sản Phẩm Nổi Bật" : "Flagship Products"}
          </h2>
          <p className="mt-3 max-w-lg text-lg text-zinc-500 dark:text-zinc-400">
            {locale === "vi"
              ? "Những sản phẩm được yêu thích nhất của chúng tôi."
              : "Our most popular picks this season."}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex"
            style={{ x: useTransformPercent(xPercent) }}
          >
            {products.map((product, i) => (
              <div key={product.id} className="w-full flex-shrink-0">
                <ProductCard
                  product={product}
                  index={i}
                  isActive={i === activeIndex}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {products.map((product, i) => (
            <button
              key={product.id}
              onClick={() => handleDotClick(i)}
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

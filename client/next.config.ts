import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

//Adds multi-language support (i18n) to your Next.js app
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");


/*
 * Same-origin `/api/media/...` is rewritten to the product API. Large/streaming responses (video Range
 * requests) often fail with 500 via this dev proxy—prefer `NEXT_PUBLIC_PRODUCT_API_ORIGIN` for `<video src>`
 * (see HeroVideo). Rewrite stays useful for simple assets if needed.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const base =
      process.env.PRODUCT_API_PROXY_TARGET?.replace(/\/$/, "") ??
      process.env.NEXT_PUBLIC_PRODUCT_API_ORIGIN?.replace(/\/$/, "") ??
      "http://localhost:3002";
    return [
      {
        source: "/api/media/:path*",
        destination: `${base}/api/media/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

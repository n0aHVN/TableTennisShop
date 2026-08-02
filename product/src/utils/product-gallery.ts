import type { ProductDoc } from "../models/product.model";
import { buildPublicMediaUrl } from "./minio";

/** Maps populated `images.imageId` into API-friendly objects including `url`. */
export function attachGalleryUrls(product: ProductDoc | null | undefined): Record<string, unknown> | null {
  if (!product) return null;
  const o =
    typeof product.toObject === "function"
      ? product.toObject()
      : ({ ...(product as object) } as Record<string, unknown>);
  const images = (o.images as Array<{ imageId?: unknown; order?: number; isPrimary?: boolean }>) ?? [];
  o.images = images.map((entry) => {
    const img = entry.imageId as Record<string, unknown> | undefined;
    if (!img || typeof img !== "object" || typeof img.key !== "string") {
      const rawId = entry.imageId as { toString?: () => string } | undefined;
      return {
        imageId: rawId?.toString?.() ?? entry.imageId,
        order: entry.order,
        isPrimary: entry.isPrimary ?? false,
      };
    }
    const id = img._id as { toString?: () => string } | undefined;
    return {
      imageId: id?.toString?.() ?? String(img._id),
      order: entry.order,
      isPrimary: entry.isPrimary ?? false,
      key: img.key,
      width: img.width,
      height: img.height,
      size: img.size,
      mimeType: img.mimeType,
      createdAt: img.createdAt,
      url: buildPublicMediaUrl(String(img.key)),
    };
  });
  return o;
}

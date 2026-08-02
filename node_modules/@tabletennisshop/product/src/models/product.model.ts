// src/models/product.model.ts
import { ProductTypeEnum, ProductStatusEnum } from '@tabletennisshop/common';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import "./image.model";

/** Gallery entry: refs Image collection + ordering / primary flag. */
export interface ProductGalleryEntry {
  imageId: Types.ObjectId;
  order: number;
  isPrimary?: boolean;
}

/** Introduction / marketing video stored in MinIO (same shape as images). */
export interface IntroductionVideo {
  key: string;
  url: string;
}

/** Arbitrary key-value specs (blade weight, size chart refs, sponge hardness, etc.). */
export type ProductAttributes = Record<string, unknown>;

export interface ProductAttrsBase {
  name: string,
  slug: string,
  brand: string,
  description: string,
  sport: string,
  type: ProductTypeEnum,
  attributes?: ProductAttributes,
  price: number,
  status: ProductStatusEnum,
  /** Optional logical prefix for this product's objects in the MinIO bucket (e.g. `products/abc123/`). */
  minioPrefix?: string,
  /** Gallery refs to Image documents. */
  images?: ProductGalleryEntry[],
  /** Introduction / promo videos in MinIO (multiple). */
  introductionVideos?: IntroductionVideo[],
}

export interface ProductDoc extends Document {
  _id: Types.ObjectId,
  name: string,
  slug: string,
  brand: string,
  description: string,
  type: ProductTypeEnum,
  sport: string,
  attributes: ProductAttributes,
  status: ProductStatusEnum,
  price: number,
  minioPrefix?: string,
  images: ProductGalleryEntry[],
  introductionVideos: IntroductionVideo[],
  createdAt: Date,
  updatedAt: Date,
  version: number,
}

//We don't need "interface ProductModel extends Model<>" for this
// because we don't have any static methods or custom instance methods
// like "build" or "findById" in this model.


// Define the base options for the schema

const baseOptions = {
  discriminatorKey: 'type', // This is used to differentiate between different types of products
  collection: 'product', // The name of the collection in MongoDB
  timestamps: true
};

const ProductSchema = new Schema<ProductDoc>({
  name: { type: String, required: true , unique: true},
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, enum: Object.values(ProductTypeEnum), required: true }, // Discriminator key
  sport: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed, required: false, default: {} },
  status: { type: String, enum: Object.values(ProductStatusEnum), default: ProductStatusEnum.OUT_OF_STOCK },
  price: { type: Number, required: true },
  minioPrefix: { type: String, required: false },
  images: {
    type: [{
      imageId: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
      order: { type: Number, required: true },
      isPrimary: { type: Boolean, default: false },
    }],
    default: [],
  },
  introductionVideos: {
    type: [{ key: { type: String, required: true }, url: { type: String, required: true } }],
    default: [],
  },
}, baseOptions);

ProductSchema.set('versionKey', 'version');
ProductSchema.plugin(updateIfCurrentPlugin);


ProductSchema.pre<ProductDoc>("save", async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateUniqueSlug(this.name);
  }
  next();
});

// ProductSchema.pre<ProductDoc>("save", function (next) {
//   const imgs = this.images ?? [];
//   const primaryCount = imgs.filter((e) => e.isPrimary).length;
//   if (primaryCount > 1) {
//     return next(new Error("Product may have at most one primary gallery image"));
//   }
//   next();
// });

export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema);

const generateUniqueSlug = (name: string, currentId?: number) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word characters
    .replace(/\s+/g, '-')     // replace spaces with hyphens
    .replace(/-+/g, '-');     // collapse multiple hyphens
  return baseSlug;
}

// Assign buildProduct as a static method after model creation
(ProductModel as any).buildProduct = function(product: any) {
  // Import here to avoid circular dependency issues
  const { RacketModel } = require('./racket.model');
  const { ShirtModel } = require('./shirt.model');
  const { SpongeModel } = require('./sponge.model');
  const { ProductTypeEnum } = require('@tabletennisshop/common');

  switch (product.type) {
    case ProductTypeEnum.RACKET:
      return RacketModel.build(product);
    case ProductTypeEnum.SHIRT:
      return ShirtModel.build(product);
    case ProductTypeEnum.SPONGE:
      return SpongeModel.build(product);
    default:
      throw new Error('Invalid product type');
  }
};

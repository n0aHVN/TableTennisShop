// src/models/product.model.ts
import { ProductTypeEnum, ProductStatusEnum } from '@tabletennisshop/common';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface ProductAttrsBase {
  name: string,
  slug: string,
  brand: string,
  description: string,
  sport: string,
  type: ProductTypeEnum, // This is the discriminator key, will be overridden in child schemas
  attributes?: any,
  price: number,
  status: ProductStatusEnum,
}

export interface ProductDoc extends Document {
  _id: Types.ObjectId,
  name: string,
  slug: string,
  brand: string,
  description: string,
  type: ProductTypeEnum, // This is the discriminator key, will be overridden in child schemas
  sport: string,
  attributes?: any,
  status: ProductStatusEnum,
  price: number,
  // Mongoose Timestamps
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
  attributes: { type: [Schema.Types.Mixed], required: false },
  status: { type: String, enum: Object.values(ProductStatusEnum), default: ProductStatusEnum.OUT_OF_STOCK },
  price: { type: Number, required: true },
}, baseOptions);

ProductSchema.set('versionKey', 'version');
ProductSchema.plugin(updateIfCurrentPlugin);


ProductSchema.pre<ProductDoc>("save", async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateUniqueSlug(this.name);
  }
  next();
});

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
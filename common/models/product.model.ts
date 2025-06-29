// src/models/product.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ProductTypeEnum } from '../enums/product-type.enum';
import { ProductStatus } from '../enums/product-status.enum';
export interface ProductAttrsBase {
  name: string,
  slug: string,
  brand: string,
  description: string,
  type: ProductTypeEnum, // This is the discriminator key, will be overridden in child schemas
  sport: string,
  attributes: any,
  status: ProductStatus,
  price: number,
}

export interface ProductDoc extends Document {
  name: string,
  slug: string,
  brand: string,
  description: string,
  type: ProductTypeEnum, // This is the discriminator key, will be overridden in child schemas
  sport: string,
  attributes: any,
  status: ProductStatus,
  price: number,
  // Mongoose Timestamp
  createdAt: Date,
  updatedAt: Date,
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
  type: { type: String, enum: Object.values(ProductTypeEnum), required: true },
  sport: { type: String, required: true },
  attributes: { type: [Schema.Types.Mixed], required: false },
  status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.ENABLE },
  price: { type: Number, required: true },
}, baseOptions);

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
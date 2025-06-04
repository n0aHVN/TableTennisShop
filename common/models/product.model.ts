// src/models/product.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ProductEnum } from '../enums/product.enum';
export interface ProductAttrsBase {
  name: string,
  brand: string,
  description: string,
  sport: string,
  attributes: any,
  price: number,
}

export interface ProductDoc extends Document {
  name: string,
  brand: string,
  description: string,
  type: ProductEnum,
  sport: string,
  attributes: any,
  slug: string,
  price: number
}

//We don't need "interface ProductModel extends Model<>" for this
const baseOptions = {
  discriminatorKey: 'type',
  collection: 'product',
  timestamps: true
};

const ProductSchema = new Schema<ProductDoc>({
  name: { type: String, required: true , unique: true},
  brand: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, required: true },
  sport: { type: String, required: true },
  attributes: { type: [Schema.Types.Mixed], require: false },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, require: true }
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
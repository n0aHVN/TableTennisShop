// src/models/product.model.ts
import { ProductStatusEnum } from '@tabletennisshop/common';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface ProductAttrsBase {
  _id: string,
  price: number,
  status: ProductStatusEnum,
  version: number
}

export interface ProductDoc extends Document {
  _id: Types.ObjectId,
  status: ProductStatusEnum,
  price: number,
  version: number,
  // Mongoose Timestamps
  createdAt: Date,
  updatedAt: Date,
}


// Define the base options for the schema

const baseOptions = {
  discriminatorKey: 'type', // This is used to differentiate between different types of products
  collection: 'product', // The name of the collection in MongoDB
  timestamps: true
};

const ProductSchema = new Schema<ProductDoc>({
  status: { type: String, enum: Object.values(ProductStatusEnum), default: ProductStatusEnum.OUT_OF_STOCK },
  price: { type: Number, required: true },
}, baseOptions);
ProductSchema.set('versionKey', 'version');
ProductSchema.plugin(updateIfCurrentPlugin);

export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema);
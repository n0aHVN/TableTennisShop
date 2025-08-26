// src/models/product.model.ts
import { ProductStatusEnum } from '@tabletennisshop/common';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ProductAttrsBase {
  price: number,
  status: ProductStatusEnum,
}

export interface ProductDoc extends Document {
  _id: Types.ObjectId,
  status: ProductStatusEnum,
  price: number,
  // Mongoose Timestamps
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
  status: { type: String, enum: Object.values(ProductStatusEnum), default: ProductStatusEnum.ENABLE },
  price: { type: Number, required: true },
}, baseOptions);


export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema);
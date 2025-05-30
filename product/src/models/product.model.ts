// src/models/product.model.ts
import mongoose, { Model, Schema } from 'mongoose';
import { ProductEnum } from '../enums/product.enum';

export interface ProductAttrsBase{
    name: string,
    brand: string,
    description: string,
    details: any;
}

export interface ProductDoc extends Document{
    name: string,
    brand: string,
    description: string,
    type: ProductEnum,
    details: any
}

//We don't need "interface ProductModel extends Model<>" for this

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'products',
};

const ProductSchema = new Schema<ProductDoc>({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, enum: Object.values(ProductEnum), required: true },
  details: {type: [Schema.Types.Mixed], require: false}
}, baseOptions);

export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema);


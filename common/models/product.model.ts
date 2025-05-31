// src/models/product.model.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { ProductEnum } from '../enums/product.enum';

const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface ProductAttrsBase{
    name: string,
    brand: string,
    description: string,
    details: any,
    price: number
}

export interface ProductDoc extends Document{
    name: string,
    brand: string,
    description: string,
    type: ProductEnum,
    details: any,
    price: number
}

//We don't need "interface ProductModel extends Model<>" for this

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'products',
  _id: false,
};

const ProductSchema = new Schema<ProductDoc>({
  _id: { type: Number },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: false },
  type: { type: String, enum: Object.values(ProductEnum), required: true },
  details: {type: [Schema.Types.Mixed], require: false},
  price: {type: Number, require: true}
}, baseOptions);

/*
  inc_field is the field in the Collections
  id: This must be unique in each Incremental Fields
*/
ProductSchema.plugin(AutoIncrement, { inc_field: '_id' , id: "product_id_seq"});

export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema);


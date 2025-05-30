import mongoose, { Document, Schema } from 'mongoose';
import { IRacketProduct } from './racket';
import { IShirtProduct } from './shirt';
import { ISpongeProduct } from './sponge';

// Union type for all product types
type IProduct = ( IRacketProduct| IShirtProduct | ISpongeProduct) & Document;

// Schema definition with type-safe validation
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['racket', 'shirt'], required: true },
    details: {
      speed_rating: {
        type: Number,
        validate: {
          validator: function (this: IProduct, value: number) {
            return this.type !== 'racket' || (value !== undefined && value !== null);
          },
          message: 'Speed rating is required for racket type',
        },
      },
      durability_rating: {
        type: Number,
        validate: {
          validator: function (this: IProduct, value: number) {
            return this.type !== 'racket' || (value !== undefined && value !== null);
          },
          message: 'Durability rating is required for racket type',
        },
      },
      composition: {
        type: String,
        validate: {
          validator: function (this: IProduct, value: string) {
            return this.type !== 'racket' || (value !== undefined && value !== null);
          },
          message: 'Composition is required for racket type',
        },
      },
      thickness: {
        type: Number,
        validate: {
          validator: function (this: IProduct, value: number) {
            return this.type !== 'racket' || (value !== undefined && value !== null);
          },
          message: 'Thickness is required for racket type',
        },
      },
      form: {
        type: String,
        validate: {
          validator: function (this: IProduct, value: string) {
            return this.type !== 'shirt' || (value !== undefined && value !== null);
          },
          message: 'Form is required for shirt type',
        },
      },
      material: {
        type: String,
        validate: {
          validator: function (this: IProduct, value: string) {
            return this.type !== 'shirt' || (value !== undefined && value !== null);
          },
          message: 'Material is required for shirt type',
        },
      },
      technology: {
        type: String,
        validate: {
          validator: function (this: IProduct, value: string) {
            return this.type !== 'shirt' || (value !== undefined && value !== null);
          },
          message: 'Technology is required for shirt type',
        },
      },
    },
    inventory: [
      {
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create the model
const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
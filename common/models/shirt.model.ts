import { Model, Schema } from "mongoose";
import { ProductTypeEnum } from "../enums/product-type.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";


export interface ShirtAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.Shirt;
}

export interface ShirtDoc extends ProductDoc {
  type: ProductTypeEnum.Shirt;
}

interface ShirtModel extends Model<ShirtDoc>{
  build(attrs: ShirtAttrs) : ShirtDoc;
}

const shirtSchema = new Schema<ShirtDoc>({});
shirtSchema.statics.build = (attrs: ShirtAttrs)=>{
  return new ShirtModel(attrs);
}

const ShirtModel = ProductModel.discriminator(ProductTypeEnum.Shirt, new Schema({
}));
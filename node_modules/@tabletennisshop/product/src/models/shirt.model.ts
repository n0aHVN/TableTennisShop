import { Model, Schema } from "mongoose";
import { ProductTypeEnum } from "@tabletennisshop/common";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";


export interface ShirtAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.SHIRT;
}

export interface ShirtDoc extends ProductDoc {
  type: ProductTypeEnum.SHIRT;
}

interface ShirtModel extends Model<ShirtDoc>{
  build(attrs: ShirtAttrs) : ShirtDoc;
}

const shirtSchema = new Schema<ShirtDoc>({});
shirtSchema.statics.build = (attrs: ShirtAttrs)=>{
  return new ShirtModel(attrs);
}

export const ShirtModel = ProductModel.discriminator<ShirtDoc, ShirtModel>(ProductTypeEnum.SHIRT, shirtSchema);
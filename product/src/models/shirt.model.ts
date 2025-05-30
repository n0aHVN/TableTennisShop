import { Model, Schema } from "mongoose";
import { ProductEnum } from "../enums/product.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";


export interface ShirtAttrs extends ProductAttrsBase{
    type: ProductEnum.Shirt;
}

export interface ShirtDoc extends ProductDoc {
  type: ProductEnum.Shirt;
}

interface ShirtModel extends Model<ShirtDoc>{
  build(attrs: ShirtAttrs) : ShirtDoc;
}

const ShirtModel = ProductModel.discriminator(ProductEnum.Shirt, new Schema({
}));


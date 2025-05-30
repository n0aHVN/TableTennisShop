import { Model, Schema } from "mongoose";
import { ProductEnum } from "../enums/product.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";

export interface RacketAttrs extends ProductAttrsBase{
    type: ProductEnum.Racket;
}

export interface RacketDoc extends ProductDoc {
  type: ProductEnum.Racket;
}


interface RacketModel extends Model<RacketDoc>{
  build(attrs: RacketAttrs) : RacketDoc;
}

export const RacketModel = ProductModel.discriminator(ProductEnum.Racket, new Schema({
}));
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

const racketSchema = new Schema<RacketDoc>({});
racketSchema.statics.build = (attrs: RacketAttrs)=>{
  return new RacketModel(attrs);
}

export const RacketModel = ProductModel.discriminator<RacketDoc, RacketModel>(ProductEnum.Racket, racketSchema);
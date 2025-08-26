import { Model, Schema } from "mongoose";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";
import { ProductTypeEnum } from "@tabletennisshop/common";

export interface RacketAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.RACKET;
};

export interface RacketDoc extends ProductDoc {
  type: ProductTypeEnum.RACKET;
}


interface RacketModel extends Model<RacketDoc>{
  build(attrs: RacketAttrs) : RacketDoc;
};

const racketSchema = new Schema<RacketDoc>({});
racketSchema.statics.build = (attrs: RacketAttrs)=>{
  return new RacketModel(attrs);
};

export const RacketModel = ProductModel.discriminator<RacketDoc, RacketModel>(ProductTypeEnum.RACKET, racketSchema);
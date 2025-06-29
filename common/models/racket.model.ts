import { Model, Schema } from "mongoose";
import { ProductTypeEnum } from "../enums/product-type.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";

export interface RacketAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.Racket;
};

export interface RacketDoc extends ProductDoc {
  type: ProductTypeEnum.Racket;
}


interface RacketModel extends Model<RacketDoc>{
  build(attrs: RacketAttrs) : RacketDoc;
};

const racketSchema = new Schema<RacketDoc>({});
racketSchema.statics.build = (attrs: RacketAttrs)=>{
  return new RacketModel(attrs);
};

export const RacketModel = ProductModel.discriminator<RacketDoc, RacketModel>(ProductTypeEnum.Racket, racketSchema);
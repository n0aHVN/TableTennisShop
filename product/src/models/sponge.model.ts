import { Model, Schema } from "mongoose";
import { ProductTypeEnum } from "../enums/product-type.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";

export interface SpongeAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.SPONGE;
}

export interface SpongeDoc extends ProductDoc {
  type: ProductTypeEnum.SPONGE;
}

interface SpongeModel extends Model<SpongeDoc>{
  build(attrs: SpongeAttrs) : SpongeDoc;
}

const spongeSchema = new Schema<SpongeDoc>({});
spongeSchema.statics.build = (attrs: SpongeAttrs)=>{
  return new SpongeModel(attrs);
}
// ─────────── Sponge ───────────
export const SpongeModel = ProductModel.discriminator<SpongeDoc, SpongeModel>(ProductTypeEnum.SPONGE, new Schema({}));
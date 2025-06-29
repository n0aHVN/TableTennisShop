import { Model, Schema } from "mongoose";
import { ProductTypeEnum } from "../enums/product-type.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";

export interface SpongeAttrs extends ProductAttrsBase{
    type: ProductTypeEnum.Sponge;
}

export interface SpongeDoc extends ProductDoc {
  type: ProductTypeEnum.Sponge;
}

interface SpongeModel extends Model<SpongeDoc>{
  build(attrs: SpongeAttrs) : SpongeDoc;
}

const spongeSchema = new Schema<SpongeDoc>({});
spongeSchema.statics.build = (attrs: SpongeAttrs)=>{
  return new SpongeModel(attrs);
}
// ─────────── Sponge ───────────
const SpongeModel = ProductModel.discriminator<SpongeDoc, SpongeModel>(ProductTypeEnum.Sponge, new Schema({}));
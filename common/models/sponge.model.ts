import { Model, Schema } from "mongoose";
import { ProductEnum } from "../enums/product.enum";
import { ProductAttrsBase, ProductDoc, ProductModel } from "./product.model";

export interface SpongeAttrs extends ProductAttrsBase{
    type: ProductEnum.Sponge;
}

export interface SpongeDoc extends ProductDoc {
  type: ProductEnum.Sponge;
}

interface SpongeModel extends Model<SpongeDoc>{
  build(attrs: SpongeAttrs) : SpongeDoc;
}

const spongeSchema = new Schema<SpongeDoc>({});
spongeSchema.statics.build = (attrs: SpongeAttrs)=>{
  return new SpongeModel(attrs);
}
// ─────────── Sponge ───────────
const SpongeModel = ProductModel.discriminator<SpongeDoc, SpongeModel>(ProductEnum.Sponge, new Schema({}));
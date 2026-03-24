import { BadRequestError, NotFoundError } from "@tabletennisshop/common";
import { FlagshipAttrs, FlagshipModel } from "../models/flagship.model";
import { ProductDoc } from "../models/product.model";

export class FlagshipService {
  static async listActiveWithProducts(): Promise<
    { sortOrder: number; product: ProductDoc }[]
  > {
    const entries = await FlagshipModel.find({ active: true })
      .sort({ sortOrder: 1 })
      .populate<{ product_id: ProductDoc }>("product_id");

    return entries.map((e) => ({
      sortOrder: e.sortOrder,
      product: e.product_id,
    }));
  }

  static async addEntry(attrs: FlagshipAttrs) {
    const exists = await FlagshipModel.findOne({ product_id: attrs.product_id });
    if (exists) {
      throw new BadRequestError("Product is already in the flagship list");
    }
    const doc = FlagshipModel.build(attrs);
    await doc.save();
    return doc;
  }

  static async removeEntryById(flagshipId: string) {
    const doc = await FlagshipModel.findByIdAndDelete(flagshipId);
    if (!doc) {
      throw new NotFoundError("Flagship entry not found");
    }
    return doc;
  }
}

import mongoose from "mongoose";
import { NotFoundError } from "@tabletennisshop/common";
import { LandingConfigDoc, LandingConfigModel } from "../models/landingConfig.model";

export class LandingConfigService {
  static async list(filters: { section?: string; activeOnly: boolean }): Promise<LandingConfigDoc[]> {
    const q: Record<string, unknown> = {};
    if (filters.activeOnly) {
      q.isActive = true;
    }
    if (filters.section) {
      q.section = filters.section;
    }
    return LandingConfigModel.find(q).sort({ section: 1, updatedAt: -1 }).exec();
  }

  static async findById(id: string): Promise<LandingConfigDoc> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundError("Landing config not found");
    }
    const doc = await LandingConfigModel.findById(id);
    if (!doc) {
      throw new NotFoundError("Landing config not found");
    }
    return doc;
  }

  static async create(attrs: {
    section: string;
    productId?: string | null;
    mediaUrl: string;
    title: string;
    subtitle: string;
    isActive?: boolean;
  }): Promise<LandingConfigDoc> {
    return LandingConfigModel.create({
      section: attrs.section,
      productId: attrs.productId ? new mongoose.Types.ObjectId(attrs.productId) : null,
      mediaUrl: attrs.mediaUrl,
      title: attrs.title,
      subtitle: attrs.subtitle,
      isActive: attrs.isActive ?? true,
    });
  }

  static async update(
    id: string,
    attrs: Partial<{
      section: string;
      productId: string | null;
      mediaUrl: string;
      title: string;
      subtitle: string;
      isActive: boolean;
    }>
  ): Promise<LandingConfigDoc> {
    const doc = await this.findById(id);
    if (attrs.section !== undefined) doc.section = attrs.section;
    if (attrs.mediaUrl !== undefined) doc.mediaUrl = attrs.mediaUrl;
    if (attrs.title !== undefined) doc.title = attrs.title;
    if (attrs.subtitle !== undefined) doc.subtitle = attrs.subtitle;
    if (attrs.isActive !== undefined) doc.isActive = attrs.isActive;
    if (attrs.productId !== undefined) {
      doc.productId = attrs.productId ? new mongoose.Types.ObjectId(attrs.productId) : null;
    }
    await doc.save();
    return doc;
  }
}

import mongoose, { Document, Schema, Types } from "mongoose";

export interface LandingConfigAttrs {
  section: string;
  productId?: Types.ObjectId | null;
  mediaUrl: string;
  title: string;
  subtitle: string;
  isActive: boolean;
}

export interface LandingConfigDoc extends Document {
  _id: Types.ObjectId;
  section: string;
  productId: Types.ObjectId | null | undefined;
  mediaUrl: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const landingConfigSchema = new Schema<LandingConfigDoc>(
  {
    section: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, required: false, default: null },
    mediaUrl: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

landingConfigSchema.index({ section: 1, isActive: 1 });

export const LandingConfigModel = mongoose.model<LandingConfigDoc>(
  "LandingConfig",
  landingConfigSchema
);

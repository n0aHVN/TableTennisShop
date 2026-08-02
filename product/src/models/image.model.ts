import mongoose, { Document, Schema, Types } from "mongoose";

/** Byte length of the object body in MinIO. */
export interface ImageAttrs {
  key: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export interface ImageDoc extends Document<Types.ObjectId>, ImageAttrs {
  createdAt: Date;
}

const ImageSchema = new Schema<ImageDoc>(
  {
    key: { type: String, required: true, unique: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  {
    collection: "images",
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ImageModel = mongoose.model<ImageDoc>("Image", ImageSchema);

import mongoose, { Document, Model, Schema, SchemaTypes, Types } from "mongoose";

export interface IRatingAttrs{
    user_id: Types.ObjectId; // User ID
    product_id: Types.ObjectId; // Product ID
    comment?: string;
    rate_score: number;
}

interface RatingDoc extends IRatingAttrs, Document {
    // Mongoose timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface RatingModel extends Model<RatingDoc> {
    build(attrs: IRatingAttrs): RatingDoc;
}

const RatingSchema = new Schema<RatingDoc>({
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    product_id: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    comment: { type: String, required: false },
    rate_score: { type: Number, required: true, min: 1, max: 5 } // Assuming rate_score is between 1 and 5
}, {
    timestamps: true,
    collection: 'rating'
});

RatingSchema.statics.build = (attrs: IRatingAttrs) => {
    return new RatingModel(attrs);
};

export const RatingModel = mongoose.model<RatingDoc, RatingModel>('Rating', RatingSchema);
import { PaymentStatus } from "@tabletennisshop/common";
import { Document, Model, Schema, Types, model } from "mongoose";

export interface PaymentAttrs {
    user_id: Types.ObjectId;
    order_id: Types.ObjectId;
    status: PaymentStatus;
    serials?: string[];
}

export interface PaymentDoc extends PaymentAttrs, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

interface PaymentModelType extends Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const PaymentSchema = new Schema<PaymentDoc>({
    user_id: { type: Schema.Types.ObjectId, required: true },
    order_id: { type: Schema.Types.ObjectId, required: true, ref: "order" },
    status: { type: String, required: true, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    serials: { type: [String], required: false },
}, {
    timestamps: true,
    collection: 'payment'
});

PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new PaymentModel(attrs);
};

export const PaymentModel = model<PaymentDoc, PaymentModelType>('Payment', PaymentSchema);


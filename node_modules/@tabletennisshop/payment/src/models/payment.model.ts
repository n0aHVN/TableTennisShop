import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";


export interface PaymentAttrs {
    user_id: string;
    order_id: string;
}

export interface PaymentDoc extends  Document {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    order_id: Types.ObjectId;
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
}, {
    timestamps: true,
    collection: 'payment'
});

PaymentSchema.set('versionKey', 'version');
PaymentSchema.plugin(updateIfCurrentPlugin);


PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new PaymentModel(attrs);
};

export const PaymentModel = model<PaymentDoc, PaymentModelType>('Payment', PaymentSchema);


import { Document, model, Model, Schema } from "mongoose";
import { AddressSchema, IAddress } from "./address.schema";

export interface VendorAttrs{
    name: string;
    addresses: IAddress[];
}

interface VendorDoc extends Document{
    name: string;
    addresses: IAddress[];
}

interface VendorModel extends Model<VendorDoc>{
    build(attr: VendorAttrs): VendorDoc;
}

const VendorSchema = new Schema<VendorDoc>({
    name: {type: String, required: true},
    addresses: [
        {type: AddressSchema, required: true}
    ]
},{
    timestamps: true,
    collection: "vendor"
});

VendorSchema.statics.build = (attrs: VendorAttrs)=>{
    return new VendorModel(attrs);
}

export const VendorModel = model<VendorDoc, VendorModel>('Vendor', VendorSchema);
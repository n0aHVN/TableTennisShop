import { Document, model, Model, Schema } from "mongoose";
import { AddressSchema, IAddress } from "./address.schema";

interface VendorAttrs{
    name: string;
    address: IAddress;
}

interface VendorDoc extends Document{
    name: string;
    address: IAddress;
}

interface VendorModel extends Model<VendorDoc>{
    build(attr: VendorAttrs): VendorDoc;
}

const VendorSchema = new Schema<VendorDoc>({
    name: {type: String, required: true},
    address: {type: AddressSchema, required: true}
},{
    timestamps: true
});

VendorSchema.statics.build = (attrs: VendorAttrs)=>{
    return new VendorModel(attrs);
}

export const VendorModel = model<VendorDoc, VendorModel>('Vendor', VendorSchema);
import { Schema } from "mongoose";

export interface IAddress {
  province: string;
  district: string;
  ward: string;
  address: string;
  phone_number: string;
}

export const AddressSchema = new Schema<IAddress>(
  {
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    address: {type: String, required: true},
    phone_number: { type: String, required: true },
  },
  { _id: false }//This schema don't need Address Schema
);
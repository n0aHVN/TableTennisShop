import mongoose, { Schema, Model, Document, model} from 'mongoose';
import { Password } from '../services/password';

const AutoIncrement = require('mongoose-sequence')(mongoose);

// 1. Define an interface for your Client fields
export interface ClientAttrs {
  email: string;
  password: string;
  full_name: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  phone_number: string;
}


//ClientDoc defines the shape of Clients inside the MongoDB
interface ClientDoc extends Document{
    email: string;
    password: string;
    full_name: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    phone_number: string;
}


//Defines model interfaces, with custom method "build()"
//build() take ClientAttrs as params and expects to return ClientDoc
interface ClientModel extends Model<ClientDoc>{
    build(attrs: ClientAttrs): ClientDoc;
}

const ClientSchema = new Schema({
  _id: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  full_name: { type: String, required: true },
  address: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  phone_number: { type: String, required: true }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  _id: false
});
ClientSchema.plugin(AutoIncrement, { inc_field: '_id' });



ClientSchema.statics.build = (attrs: ClientAttrs) => {
  return new Client(attrs);
};

ClientSchema.pre('save', async function (next) {
  if (this.isModified('email')){
    const existingUser = await Client.findOne({ email: this.email });
    if (existingUser){
      throw new Error("Email already exists!");
    }
  }

  if (this.isModified('password')){
    this.password = await Password.toHash(this.password);
  }
  next();
});

export const Client = model<ClientDoc, ClientModel>('Client', ClientSchema);

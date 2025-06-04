import { Schema, Model, Document, model} from 'mongoose';
import { Password } from '../services/password';
import { UserEnum } from '../enums/user.enum';
import { AddressSchema, IAddress } from './address.schema';


// 1. Define an interface for your User fields
export interface UserAttrs {
  email: string;
  password: string;
  full_name: string;
  addresses: IAddress[];
  type: string;
  province: string;
  district: string;
  ward: string;
  phone_number: string;
  status: string;
}


//UserDoc defines the shape of Users inside the MongoDB
interface UserDoc extends Document{
    email: string;
    password: string;
    full_name: string;
    addresses: IAddress[];
    type: string;
    province: string;
    district: string;
    ward: string;
    phone_number: string;
}


//Defines model interfaces, with custom method "build()"
//build() take UserAttrs as params and expects to return UserDoc
interface UserModel extends Model<UserDoc>{
    build(attrs: UserAttrs): UserDoc;
}

const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  full_name: { type: String, required: true },
  addresses: [
    {type: AddressSchema, required: true}
  ],
  type: { type: String, enum: Object.values(UserEnum), required: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  collection: "user"
});



UserSchema.statics.build = (attrs: UserAttrs) => {
  return new UserModel(attrs);
};

UserSchema.pre('save', async function (next) {
  if (this.isModified('email')){
    const existingUser = await UserModel.findOne({ email: this.email });
    if (existingUser){
      throw new Error("Email already exists!");
    }
  }

  if (this.isModified('password')){
    this.password = await Password.toHash(this.password);
  }
  next();
});

export const UserModel = model<UserDoc, UserModel>('User', UserSchema);

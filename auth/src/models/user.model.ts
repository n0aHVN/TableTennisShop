import { Schema, Model, Document, model, Types} from 'mongoose';
import { Password, UserEnum, UserStatusEnum } from '@tabletennisshop/common';


// 1. Define an interface for your User fields
export interface UserAttrs {
  username: string;
  email: string;
  password: string;
  full_name: string;
  address: string;
  type: string;
  status: UserStatusEnum;
}


//UserDoc defines the shape of Users inside the MongoDB
export interface UserDoc extends Document{
    _id: Types.ObjectId; // Mongoose ObjectId
    username: string;
    email: string;
    password: string;
    full_name: string;
    address: string;
    type: string;
    status: UserStatusEnum;
    // Mongoose Timestamps
    createdAt: Date;
    updatedAt: Date;
}


//Defines model interfaces, with custom method "build()"
//build() take UserAttrs as params and expects to return UserDoc
interface UserModel extends Model<UserDoc>{
    build(attrs: UserAttrs): UserDoc;
}

const UserSchema = new Schema<UserDoc>({
  username: { type: String, required: true, unique: true, minlength: 5 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  full_name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: Object.values(UserEnum), required: true },
  status: { type: String, enum: Object.values(UserStatusEnum), required: true }
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
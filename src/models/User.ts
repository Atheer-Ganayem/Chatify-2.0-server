import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: Date;
}

const UserSchema: mongoose.Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 60,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    required: true,
  },
});

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;

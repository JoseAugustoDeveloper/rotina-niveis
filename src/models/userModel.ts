import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  points: number;
  level: number;
  isOnline: boolean;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  isOnline: { type: Boolean, default: false }
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
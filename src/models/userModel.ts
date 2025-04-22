import mongoose, { Schema, Document } from "mongoose";
import { IActivity } from './activityModel';

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  nickname: string;
  email: string;
  password: string;
  points: number;
  level: number;
  isOnline: boolean;
  isPrivate: boolean;
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  achievements: string[];
  activities: IActivity[];
  fotoPerfil: string;
}

const UserSchema: Schema = new Schema({
  nickname: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  isOnline: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  friendRequests: [{ type: mongoose.Schema.ObjectId, ref: "User"}],
  achievements: { type: [String], default: [] },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  fotoPerfil: { type: String, default: ""}
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
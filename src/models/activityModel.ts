import mongoose, { Schema, Document } from "mongoose";

interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  description: string;
  points: number;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  description: { type: String, required: true },
  points: { type: Number, required: true},
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity
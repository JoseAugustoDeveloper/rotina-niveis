import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  classe: string;
  date: Date;
  isRecurring: boolean;
  completed: boolean;
  description?: string;
  points: number;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  name: { type: String, required: true },
  classe: { type: String, enum:["Saúde", "Atividade Física", "Lazer",  "Esporte", "Trabalho/Estudo", "Casa/Organização"], required: true},
  date: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  description: { type: String },
  points: { type: Number, required: true},
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity
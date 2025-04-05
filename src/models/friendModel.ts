import mongoose, { Schema, Document } from "mongoose"

interface IFriend extends Document {
  user: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
}

const FriendSchema: Schema = new Schema ({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const Friend = mongoose.model<IFriend>("Friend", FriendSchema);

export default Friend
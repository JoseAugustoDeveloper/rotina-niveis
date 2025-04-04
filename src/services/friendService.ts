// import Friend  from "../models/friendModel"
// import User from "models/userModel"
// import mongoose from "mongoose"

// export const sendFriendRequest = async (userId: string, friendId: string) => {
//   if (userId === friendId) throw new Error("Você não pode adicionar a si mesmo como amigo!");

//   const friendExists = await Friend.findOne({ userId, friendId });
//   if (friendExists) throw new Error("Solicitação já enviada ou amigo já adcionado.");

//   return await Friend.create({ userId, friendId });
// };

// export const acceptFriendRequest = async (userId: string, friendId: string) => {
//   const friendRequest = await Friend.findOne({ userId: friendId, friendId: userId });
//   if(!friendRequest) throw new Error("Solicitação de amizade não encontrada!");

//   await Friend.create({ userId, friendId });
//   return await Friend.create({ userId: friendId, friendId: userId });
// };

// export const removeFriend = async (userId: string, friendId: string) => {
//   await Friend.deleteOne({ userId, friendId })
//   await Friend.deleteOne({ userId: friendId, friendId: userId });
// };

// export const listFriends = async (userId: string) => {
//   const friends = await Friend.find({ userId }).populate({ path: "friendId", select: "_id nickname"  });
//   return friends.map((f) => ({ id: f.friendId._id, nickname: (f.friendId as any).nickname }));
// };
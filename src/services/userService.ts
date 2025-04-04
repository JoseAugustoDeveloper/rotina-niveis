// import User, { IUser } from "../models/userModel"
// import mongoose from "mongoose"

// class UserService {
//   // Buscar usuário pelo ID
//   async getUserById(userId: string): Promise<IUser | null> {
//     if(!mongoose.Types.ObjectId.isValid(userId)) return null;
//     return await User.findById(userId).select("-password");
//   }

//   async getUserByemail(email: string): Promise<IUser | null> {
//     return await User.findOne({ email }).select("-password");
//   }

//   async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
//     if(!mongoose.Types.ObjectId.isValid(userId)) return null;
//     return await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
//   }

//   async updatePrivacy(userId: string, isPublic: boolean): Promise<IUser | null> {
//     if(!mongoose.Types.ObjectId.isValid(userId)) return null;
//     return await User.findByIdAndUpdate(userId, {isPublic }, {new: true }).select("-password")
//   }
// }

// export default new UserService()
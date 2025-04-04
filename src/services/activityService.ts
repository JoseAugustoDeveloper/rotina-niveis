// import Activity from "models/activityModel";
// import mongoose from "mongoose";

// export const addActivity = async (userId: string, title: string, category: string, points: number) => {
//   if(!userId || !title || !category || points < 0) {
//     throw new Error("Dados inválidos para criação da atividade.");
//   }

//   return await Activity.create({ userId, title, category, points })
// };

// export const listActivities = async (userId: string) => {
//   if(!mongoose.Types.ObjectId.isValid(userId)) {
//     throw new Error("ID de usuário inválido!");
//   }

//   const activities = await Activity.find({ userId }).sort({ createAt: -1});

//   return activities.length > 0 ? activities : "Sem atividades recentes";
// };

// export const removeActivity = async (userId: string, activityId: string) => {
//   const activity = await Activity.findOne({ _id: activityId, userId });

//   if(!activity) throw new Error("Atividade não encontrada.");

//   await Activity.deleteOne({ _id: activityId });
//   return { message: "Atividade removida com sucesso!"}
// };

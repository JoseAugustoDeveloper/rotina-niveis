import { FastifyInstance } from "fastify";
import Activity from "./models/activityModel";
import User from "./models/userModel";
import mongoose from "mongoose";

export default async function (app: FastifyInstance) {
  app.post("/activities", async (request, reply) => {
    try {
      console.log("📌 Recebendo requisição:", request.body);

      const { userId, description, points } = request.body as {
        userId: string;
        description: string;
        points: number;
      };

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("❌ ID de usuário inválido:", userId);
        return reply.status(400).send({ message: "ID de usuário inválido" });
      }

      const user = await User.findById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado" })
      }

      console.log("✅ Usuário encontrado:", user);

      await Activity.create({ userId, description, points });
      console.log("✅ Atividade criada:", Activity);

      user.points += points;

      if (user.points >= user.level * 100) {
        user.level += 1;
      }
      await user.save()

      return reply.send({ message: "Atividade registrada com sucesso!", user });

    } catch (error) {
      console.error("❌ Erro ao registrar atividade:", error);
      reply.status(500).send({ error: "Erro ao registrar atividade" });
    }
  })
}
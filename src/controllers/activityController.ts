import { FastifyInstance } from "fastify";
import Activity from "../models/activityModel";
import { IActivity } from "../models/activityModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import { UpdateQuery } from 'mongoose';

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
  });

  app.post('/activity/add',{ preHandler: [app.authenticate] }, async (request, reply) => {
    try {
       const body = request.body as {
      name: string;
      category: string;
      points: number;
      isRecurring?: boolean;
      date: string;
      description: string;
    };

      const { name, category, points, isRecurring, date, description } = body;

      if (!name || !category || !points || !date || !description) {
        return reply.status(400).send({ message: "Todos os campos são obrigatórios!" });
      }
  
      const newActivity = new Activity({
        userId: request.userId, 
        name, 
        category, 
        points, 
        isRecurring: isRecurring || false,
        date: new Date(date),
        description,
      });
  
      await newActivity.save();
  
      return reply.send({ message: "Atividade adicionada com sucesso!", activity: newActivity });
    } catch (error) {
      console.error("Erro ao adicionar atividade:", error);
      return reply.status(500).send({ message: "Erro ao adicionar atividade", error });
    }
  });

  app.patch('/activity/complete:/id', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const activity = await Activity.findOneAndUpdate(
        { _id: id, userId: request.userId },
        { completed: true },
        { new: true }
      );
      
      if (!activity) {
        return reply.status(404).send({ message: "Atividade não encontrada!" });
      }

      const user = await User.findById(request.userId);
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }
      
      user.points += activity.points;
      const completedActivities = await Activity.countDocuments({ userId: request.userId, completed: true });
      if (completedActivities >= 10 && !user.achievements.includes("Troféu das 10 atividades")) {
        user.achievements.push("Troféu das 10 atividades");
      }
      
      await user.save();
      
      reply.send({ message: "Atividade concluída!", activity, points: user.points, level: user.level, achievements: user.achievements });
    
    } catch (error) {
      reply.status(500).send({ message: "Erro ao marcar como concluída" });
    }
  });

  app.get('/activities', { preHandler: [app.authenticate]}, async (request, reply) => {
    try {
      const { category, date, status } = request.query as {
      category: String,
      date: Date,
      status: String
      }
      
      const filter: any = { userId: request.userId };
      if (category) {
        filter.category = category
      }
      if (date) {
        filter.date = new Date(date)
      }
      if (status === 'completed') {
        filter.completed = true
      }
      if (status === 'pending') {
        filter.completed = false
      }

      const activies = await Activity.find(filter);
      reply.send(activies)
    } catch (error) {
      reply.status(500).send({ message: "Erro ao buscar atividades!" });
    }
  });

  app.put<{ Params: { id: string }, Body: UpdateQuery<IActivity> }>(
    '/activity/edit/:id', 
    { preHandler: [app.authenticate] }, 
    async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updateActivityData = request.body as UpdateQuery<IActivity>;
      
      const updateActivity = await Activity.findOneAndUpdate(
        { _id: id, userId: request.userId },
        updateActivityData,
        { new: true }
      );
      if (!updateActivity) {
        return reply.status(404).send({ message: "Atividade não encontrada!"})
      }
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao editar atividade!"})
    }
  });

  app.delete('/activity/delete/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string};
      const deletedActivity = await Activity.findOneAndDelete({ _id: id, userId: request.userId });
      if (!deletedActivity) return reply.status(404).send({ message: 'Atividade não encontrada' });
      reply.send({ message: 'Atividade removida com sucesso' });
    } catch (error) {
      reply.status(500).send({ message: 'Erro ao deletar atividade' });
    }
  });
}
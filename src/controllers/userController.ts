import { FastifyInstance } from "fastify";
import User from "../models/userModel";
import Friend from "../models/friendModel";
import { calculateLevel } from "../utils/calculateLevel";
import { calculateWeeklyStats } from "../utils/statistics";
import Activity from "../models/activityModel";
import { FastifyRequest, FastifyReply } from "fastify";
import type mongoose from "mongoose";
import upload from "../config/configMulter";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";
import util from "util";


declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}


export default async function userRoutes(app: FastifyInstance) {
  // Buscar perfil do usuário
  app.get(
    "/user/perfil",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        console.log("Token verificado!");

        console.log("Usuário no token:", request.user);
        const user = await User.findOne({
          email: (request.user as { email: string }).email,
        });

        if (!user) {
          console.log("Usuário não encontrado no banco.");
          return reply.status(404).send({ message: "Usuário não encontrado!" });
        }

        if (user.isPrivate) {
          const friend = await Friend.findOne({
            userId: user.id,
            friendId: (request.user as { id: mongoose.Types.ObjectId }).id,
          });
          if (!friend) {
            return reply
              .status(403)
              .send({ message: "Você não pode ver esse perfil!" });
          }
        }

        return reply.send({ user });
      } catch (error) {
        console.error("Erro na autenticação:", error);
        return reply
          .status(401)
          .send({ message: "Token inválido ou não fornecido!" });
      }
    }
  );

  // Atualizar perfil do usuário
  app.put(
    "/user/perfil",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { email } = request.user as { email: string };
        const { newEmail, password } = request.body as {
          newEmail?: string;
          password?: string;
        };
        console.log("Token verificado!");

        console.log("Usuário no token:", request.user);
        const user = await User.findOne({ email });
        console.log("Usuário encontrado no banco:", user); // LOG PARA VER SE O USUÁRIO EXISTE
        if (!user) {
          console.log("Usuário não encontrado no banco.");
          return reply.status(404).send({ message: "Usuário não encotrado!" });
        }

        if (newEmail) user.email = newEmail;
        if (password) user.password = password;

        await user.save();
        return reply.send({ message: "Perfil atualizado com sucesso!" });
      } catch (error) {
        console.error("Erro na autenticação:", error);
        return reply
          .status(500)
          .send({ message: "Erro ao atualizar o perfil!" });
      }
    }
  );

  // Foto de perfil
  const pump = util.promisify(pipeline);

  app.post("/user/upload", {  preHandler: [app.authenticate, upload.single("file")] }, async (request: any, response) => {
    try {
      const file = request.file;
      const userId = request.user?.id

      if(!file){
        return response.status(400).send({ message: "Nenhum arquivo encontrado." });
      }

      const fileName = `${Date.now()}-${file.filename}`;
      const filePath = path.join(__dirname, "..", "uploads", fileName);
      const fileStream = fs.createWriteStream(filePath);

      await pump(file.file, fileStream);

      const url = `/uploads/${fileName}`;

      await User.findByIdAndUpdate(userId, {
        fotoPerfil: url,
      });

      return response.send({ sucess: true, url })
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      return response.status(500).send({ message: "Erro interno no servidor." });
    }
  })

  // Buscar usuarios
  app.get("/user/search", async (request, reply) => {
    try {
      const { nickname } = request.query as { nickname: string };
      if (!nickname) {
        return reply.status(400).send({ message: "Nickname não informado!" });
      }

      const user = await User.findOne({ nickname: nickname });

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }

      return reply.send(user);
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao buscar usuário!" });
    }
  });


  // Listar amigos do usuário
  app.get(
    "/user/friends",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { nickname } = request.user as { nickname: string };

        const user = await User.findOne({ nickname });
        if (!user) {
          return reply.status(404).send({ message: "Usuário não encontrado!" });
        }

        const friends = await Friend.find({ userId: user._id }).populate(
          "friend",
          "email"
        );
        return reply.send(friends);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao listar amigos! " });
      }
    }
  );

  // Adicionar amigo
  app.post(
    "/user/add-friend",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { nickname } = request.body as { nickname: string };
        console.log("Nickname recebido:", nickname); // LOG PARA VERIFICAR DADO ENVIADO

        const user = await User.findById(request.user?.id);

        console.log("Usuário autenticado:", user); // LOG PARA VERIFICAR SE O USUÁRIO FOI ENCONTRADO

        if (!user) {
          return reply
            .status(404)
            .send({ message: "Usuário ou amigo não encontrado!" });
        }

        const friend = await User.findOne({ nickname });
        console.log("Amigo encontrado:", user.id); // LOG PARA VERIFICAR SE O AMIGO FOI ACHADO
        if (!user.id || !friend) {
          console.log("⚠️ Usuário não encontrado!");
          return reply.status(404).send({ message: "Amigo não encontrado!" });
        }

        if (user._id.equals(friend.id)) {
          return reply
            .status(400)
            .send({ message: "Você não pode se adicionar como amigo!" });
        }

        if (friend.isPrivate) {
          if (!friend.friendRequests.includes(user.id)) {
            friend.friendRequests.push(user.id);
            await friend.save();
          }
          return reply.send({ message: "Solicitação de amizade enviada!" });
        }
        console.log(
          `Verificando se ${user.nickname} já é amigo de ${friend.nickname}`
        );
        const alreadyFriends = await Friend.findOne({
          userId: user.id,
          friendId: friend.id,
        });
        if (alreadyFriends) {
          return reply.status(400).send({ message: "Vocês já são amigos!" });
        }

        if (!user.friends.includes(friend.id)) {
          user.friends.push(friend.id);
          friend.friends.push(user.id);
          await user.save();
          await friend.save();
        }

        return reply.send({ message: "Amigo adicionado!" });
      } catch (error) {
        console.error("Erro ao adicionar amigo:", error); // Adicionando log detalhado do erro
        return reply.status(500).send({ message: "Erro ao adicionar amigo!" });
      }
    }
  );

  app.post(
    "/user/accept-friend",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { requestId } = request.body as { requestId: string };
        const user = await User.findById(request.user?.id);
        const requester = await User.findById(requestId);

        if (!user || !requester) {
          return reply.status(404).send({ message: "Usuário não encontrado!" });
        }

        if (!user.friendRequests.includes(requester._id)) {
          return reply
            .status(400)
            .send({ message: "Solicitação não encontrada!" });
        }

        user.friendRequests = user.friendRequests.filter((id) =>
          id.equals(requester._id)
        );
        user.friends.push(requester._id);
        requester.friends.push(user._id);

        await user.save();
        await requester.save();

        return reply.send({ message: "Amizade aceita!" });
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao aceitar solicitação!" });
      }
    }
  );

  app.post("/user/decline-friend", async (request, reply) => {
    try {
      const { requestId } = request.body as { requestId: string };
      const user = await User.findById(request.userId);

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado" });
      }

      user.friendRequests = user.friendRequests.filter(
        (id) => !id.equals(requestId)
      );
      await user.save();

      return reply.send({ message: "Solicitação recusada!" });
    } catch (error) {
      return reply
        .status(500)
        .send({ message: "Erro ao recusar solicitação!" });
    }
  });

  app.get(
    "/user/level",
    async function getUserLevel(request: FastifyRequest, reply: FastifyReply) {
      try {
        const user = await User.findById(request.user?.id);
        if (!user)
          return reply.status(404).send({ message: "Usuário não encontrado" });

        const level = calculateLevel(user.points);
        return reply.send({ level, points: user.points });
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao buscar nível do usuário" });
      }
    }
  );

  app.get(
    "/user/activities", { preHandler: [app.authenticate] },
    async (request, reply) => {
      console.log("Request recebido para /user/activities");
      console.log("User ID:", request.user?.id);

      try {
        const user = await User.findById(request.user?.id).populate("activities", "date name category points");
        if (!user) {
          return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        console.log("Atividades encontradas:", user.activities);

        const recentActivities = user.activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3);
        return reply.send(recentActivities);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar atividades!" });
      }
    }
  )

  app.post(
    "/user/activities-add", { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const body = request.body as {
          name: string;
          classe: string;
          points: number;
          isRecurring?: boolean;
          date: string;
          description: string;
        };

        const { name, classe, points, isRecurring, date, description } = body;

        if (!name || !classe || !points || !date || !description) {
          return reply.status(400).send({ message: "Todos os campos são obrigatórios!" });
        }

        const newActivity = new Activity({
          userId: request.user?.id,
          name,
          classe,
          points,
          isRecurring: isRecurring || false,
          date: new Date(date),
          description,
        });

        await newActivity.save();

        await User.findByIdAndUpdate(request.user?.id, {
          $push: { activities: newActivity._id }
        });

        return reply.send({ message: "Atividade adicionada com sucesso!", activity: newActivity });
      } catch (error) {
        console.error("Erro ao adicionar atividade:", error);
        return reply.status(500).send({ message: "Erro ao adicionar atividade", error });
      }
    });

  // estatisticas do usuario
  app.get(
    "/user/statistics", { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const user = await User.findById(request.user?.id);
        if (!user) {
          return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const activities = await Activity.find({ userId: user._id, date: { $gte: startDate } });

        const weeklyStats = calculateWeeklyStats(activities); // Lógica de agregação semanal/mensal
        return reply.send(weeklyStats);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar estatísticas!" });
      }
    }
  )
}

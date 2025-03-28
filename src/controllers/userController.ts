  import { FastifyInstance } from "fastify";
  import User from "../models/userModel";
  import Friend from "../models/friendModel";
  import { authenticate } from "../middlewares/authenticate";
  import type { AuthenticatedRequest } from "types";
  import { FastifyRequest, FastifyReply } from "fastify";
  import type mongoose from "mongoose";
  import jwt from "jsonwebtoken"

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
      "/user/profile",
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

    // Buscar usuarios
    app.get(
      "/user/search", async (request, reply) => {
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

    // Atualizar perfil do usuário
    app.put(
      "/user/profile", { preHandler: [app.authenticate] }, async (request, reply) => {
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
        return reply.status(500).send({ message: "Erro ao atualizar o perfil!" });
      }
    });

    // Listar amigos do usuário
    app.get(
      "/user/friends",
      { preHandler: [app.authenticate] },
      async (request, reply) => {
        try {
          
          const { email } = request.user as { email: string };

          const user = await User.findOne({ email });
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
    "/user/add-friend", { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      
      const { nickname } = request.body as { nickname: string };
      console.log("Nickname recebido:", nickname); // LOG PARA VERIFICAR DADO ENVIADO
      
      const user = await User.findById(request.userId);

      console.log("Usuário autenticado:", user); // LOG PARA VERIFICAR SE O USUÁRIO FOI ENCONTRADO

      if (!user) {
        return reply
          .status(404)
          .send({ message: "Usuário ou amigo não encontrado!" });
      }

      const friend = await User.findOne({ nickname });
      console.log("Amigo encontrado:", friend); // LOG PARA VERIFICAR SE O AMIGO FOI ACHADO
      if (!user || !friend) {
        console.log("⚠️ Usuário não encontrado!");
        return reply.status(404).send({ message: "Amigo não encontrado!" });
      }

      if (user._id.equals(friend._id)) {
        return reply
          .status(400)
          .send({ message: "Você não pode se adicionar como amigo!" });
      }

      if (friend.isPrivate) {
        if (!friend.friendRequests.includes(user._id)) {
          friend.friendRequests.push(user._id);
          await friend.save();
        }
        return reply.send({ message: "Solicitação de amizade enviada!" });
      }
      console.log(`Verificando se ${user.nickname} já é amigo de ${friend.nickname}`);
      const alreadyFriends = await Friend.findOne({
        userId: user._id,
        friendId: friend._id,
      });
      if (alreadyFriends) {
        return reply.status(400).send({ message: "Vocês já são amigos!" });
      }

      if (!user.friends.includes(friend._id)) {
        user.friends.push(friend._id);
        friend.friends.push(user._id);
        await user.save();
        await friend.save();
      }
      const token = jwt.sign({ id: user._id, email:user.email, nickname: user.nickname }, "supersecretkey", { expiresIn: "1h" });
      reply.setCookie("auth_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        path: "/"
      })

      return reply.send({ message: "Amigo adicionado!" });
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error); // Adicionando log detalhado do erro
      return reply.status(500).send({ message: "Erro ao adicionar amigo!" });
    }
  });

  app.post(
    "/user/accept-friend", { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { requestId } = request.body as { requestId: string };
        const user = await User.findById(request.userId);
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

  app.post(
    "/user/decline-friend",
    async (request, reply) => {
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
    }
  );
}

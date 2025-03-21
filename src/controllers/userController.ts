import { FastifyInstance } from "fastify";
import User from "../models/userModel";
import Friend from "../models/friendModel";

export default async function userRoutes(app: FastifyInstance) {
  
  // Buscar perfil do usuário
  app.get("/user/profile", async (request, reply) => {
    try {
      await request.jwtVerify();
      const user = await User.findOne({ email: (request.user as { email: string }).email });
  
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }
  
      return reply.send({ user });
    } catch (error) {
      return reply.status(401).send({ message: "Token inválido ou não fornecido!" });
    }
  });

  // Atualizar perfil do usuário
  app.put("/user/profile", async (request, reply) => {
    try {
      await request.jwtVerify()
      const { email } = request.user as { email: string };
      const { newEmail, password } = request.body as { newEmail?: string; password?: string };

      const user = await User.findOne({ email });
      if(!user){
        return reply.status(404).send({ message: "Usuário não encotrado!"})
      }

      if(newEmail) user.email = newEmail;
      if(password) user.password = password; 

      await user.save()
      return reply.send({ message: "Perfil atualizado com sucesso!"});
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao atualizar o perfil!"})
    }
  });

   // Listar amigos do usuário
  app.get("/user/friends", async (request, reply) => {
    try {
      await request.jwtVerify();
      const { email } = request.user as { email: string };

      const user = await User.findOne({ email });
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }

      const friends = await Friend.find({ userId: user._id}).populate("friend", "email")
      return reply.send(friends)
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao listar amigos! "});
    }
  });

  // Adicionar amigo
  app.post("/user/add-friend", async (request, reply) => {
    try {
      await request.jwtVerify();
      const { email } = request.user as { email: string };
      const { friendEmail } = request.body as { friendEmail: string };

      const user = await User.findOne({ email });
      const friend = await User.findOne({ email: friendEmail });

      if (!user || !friend) {
        return reply.status(404).send({ message: "Usuário ou amigo não encontrado!" });
      }

      if (user._id.equals(friend._id)) {
        return reply.status(400).send({ message: "Você não pode se adicionar como amigo!" });
      }

      const alreadyFriends = await Friend.findOne({ userId: user._id, friendId: friend._id});
      if (alreadyFriends) {
        return reply.status(400).send({ message: "Vocês já são amigos!" });
      }

      await Friend.create({ userId: user._id, friendId: friend._id});
      return reply.send({ message: "Amigo adicionado com sucesso!" });
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao adicionar amigo!" });
    }
  })
}


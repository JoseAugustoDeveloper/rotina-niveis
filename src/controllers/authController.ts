import { FastifyInstance } from "fastify";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/userModel";
import "../types"


export default async function authRoutes(app: FastifyInstance) {
  
  app.post("/register", async (request, reply) => {
    const { nickname, email, password } = request.body as { nickname: string, email: string, password: string };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.status(400).send({ message: "Usuário já existe!" })
    }

    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return reply.status(404).send({ message: "Nickname já está sendo usado!"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      nickname,
      email, 
      password: hashedPassword,
    });

    await newUser.save()
    return reply.send({ message: "Usuário registrado com sucesso!" })
  });

  app.post("/login", async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const user = await User.findOne({ email });

    if (!user) {
      return reply.status(401).send({ message: "Usuário não encontrado" })
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.status(401).send({ message: "Senha incorreta!" })
    }

    const token = jwt.sign({ id: user._id, email:user.email, nickname: user.nickname }, "supersecretkey", { expiresIn: "1h" });
    console.log("🔹 Token gerado:", token);
    reply.setCookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    })
    user.isOnline = true;
    await user.save();

    return reply.send({ message: "Login bem-sucedido!", token, user })
  })

  app.post("/logout", async (request, reply) => {
    try {
       // Verifica se o usuário está autenticado
      const user = await User.findOne({ email: (request.user as { email: string }).email });

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }

      // Atualiza o status para offline
      user.isOnline = false;
      await user.save();

      reply.clearCookie("auth_token");
      return reply.send({ message: "Logout realizado com sucesso!" });
    } catch (error) {
      return reply.status(401).send({ message: "Erro ao deslogar" });
    }
  });

}
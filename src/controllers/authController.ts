import { FastifyInstance } from "fastify";
import bcrypt from 'bcryptjs'
import jwt from 'fastify-jwt';
import User from "../models/userModel";

export default async function authRoutes(app: FastifyInstance) {
  
  app.post("/register", async (request, reply) => {
    const { nickname, email, password, isPrivate } = request.body as { nickname: string, email: string, password: string, isPrivate?: boolean };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.status(400).send({ message: "Usuário já existe!" })
    }

    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return reply.status(200).send({ message: "Nickname já está sendo usado!"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      nickname,
      email, 
      password: hashedPassword, 
      isPrivate: isPrivate ?? false 
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

    const token = app.jwt.sign({ id: user._id, email:user.email, nickname: user.nickname }, { expiresIn: "1h" });
    console.log("🔹 Token gerado:", token);
    reply.setCookie("auth_token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/"
    })
    user.isOnline = true;
    await user.save();

    return reply.send({ message: "Login bem-sucedido!", token, user })
  })

  app.post("/logout", async (request, reply) => {
    try {
      await request.jwtVerify(); // Verifica se o usuário está autenticado
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

  app.get('/profile', async (request, reply) => {
    try {
      const token = request.cookies.auth_token;
      if (!token) {
        return reply.status(401).send({ message: "Não autenticado!" })
      }

      const decoded = app.jwt.verify<{ email: string }>(token);
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return reply.status(401).send({ message: "Usuário não encontrado " });
      }

      return reply.send({ message: "Acesso permitido!", user });
    } catch (error) {
      return reply.status(401).send({ message: 'Token inválido ou não fornecido!' })
    }
  })

  app.post("/add-points", async (request, reply) => {
    try {
      await request.jwtVerify();
      const { points } = request.body as { points: number };

      const user = await User.findOne({ email: (request.user as { email: string }).email })
      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado!" });
      }

      user.points += points;

      while (user.points >= user.level * 10) {
        user.points -= user.level * 10;
        user.level += 1;
      }

      await user.save();

      return { message: "Pontos adicionados!", user };
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao adicionar pontos!" });
    }

  })
}
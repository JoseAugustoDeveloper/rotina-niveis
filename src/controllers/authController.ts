// import bcrypt from "bcryptjs";
// import jwt from "fastify-jwt";
// import User from "../models/userModel";
// import { FastifyReply, FastifyRequest } from "fastify";

// // Função para registrar um novo usuário
// export async function registerUser(request: FastifyRequest, reply: FastifyReply) {
//   const { email, password } = request.body as { email: string; password: string };

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return reply.status(400).send({ message: "Usuário já existe!" });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({ email, password: hashedPassword });

//   await newUser.save();
//   return reply.send({ message: "Usuário registrado com sucesso!" });
// }

// // Função para fazer login
// export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
//   const { email, password } = request.body as { email: string; password: string };
//   const user = await User.findOne({ email });

//   if (!user) {
//     return reply.status(401).send({ message: "Usuário não encontrado" });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return reply.status(401).send({ message: "Senha incorreta!" });
//   }

//   const token = reply.jwt.sign({ email });
//   return reply.send({ message: "Login bem-sucedido!", token });
// }

// // Função para obter o perfil do usuário
// export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     await request.jwtVerify();
//     return { message: "Acesso permitido!", user: request.user };
//   } catch (error) {
//     return reply.status(401).send({ message: "Token inválido ou não fornecido!" });
//   }
// }

// // Função para adicionar pontos ao usuário
// export async function addPoints(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     await request.jwtVerify();
//     const { points } = request.body as { points: number };

//     const user = await User.findOne({ email: (request.user as { email: string }).email });
//     if (!user) {
//       return reply.status(404).send({ message: "Usuário não encontrado!" });
//     }

//     user.points += points;

//     // Atualizar o nível do usuário, se necessário
//     while (user.points >= user.level * 10) {
//       user.points -= user.level * 10;
//       user.level += 1;
//     }

//     await user.save();
//     return reply.send({ message: "Pontos adicionados!", user });
//   } catch (error) {
//     return reply.status(500).send({ message: "Erro ao adicionar pontos!" });
//   }
// }

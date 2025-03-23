// authenticate.ts
import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../types";
import mongoose from "mongoose";

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const token = request.cookies.auth_token; // Busca o token do cookie

    if (!token) {
      return reply.status(401).send({ message: "Token não fornecido!" });
    }

    const decoded = await request.jwtVerify<{ id: string }>(); // Usando a verificação de JWT do fastify
    request.userId = new mongoose.Types.ObjectId(decoded.id); // Definindo o ID do usuário no request

    console.log("✅ Usuário autenticado com ID:", request.userId);
  } catch (error) {
    console.error("❌ Erro na autenticação:", error);
    return reply.status(401).send({ message: "Token inválido ou não fornecido!" });
  }
}

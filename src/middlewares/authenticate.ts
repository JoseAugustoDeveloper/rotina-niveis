// authenticate.ts
import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../types";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    console.log("🔎 Cookies recebidos:", request.cookies);
    console.log("Headers recebidos:", request.headers);
    const token = request.cookies.auth_token || request.headers.authorization?.replace("Bearer ", "");; // Pega o token do cookie
    
    console.log("Token recebido:", token); // LOG IMPORTANTE
    
    if (!token) {
      return reply.status(401).send({ message: "Token não fornecido!" });
    }

    const decoded = jwt.verify(token, "supersecretkey") as { id: string; email: string; nickname: string} // Usando a verificação de JWT do fastify
   
    request.user = {
      id: new mongoose.Types.ObjectId(decoded.id),
      email: decoded.email,
      nickname: decoded.nickname
    };
 // Definindo o ID do usuário no request

    console.log("✅ Usuário autenticado com ID:", request.user.id);
  } catch (error) {
    console.error("❌ Erro na autenticação:", error);
    return reply.status(401).send({ message: "Token inválido ou não fornecido!" });
  }
}

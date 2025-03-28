// authenticate.ts
import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../types";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    console.log("🔎 Cookies recebidos:", request.cookies);
    const token = request.cookies.auth_token; // Pega o token do cookie
    
    console.log("Token recebido:", token); // LOG IMPORTANTE
    
    if (!token) {
      return reply.status(401).send({ message: "Token não fornecido!" });
    }

    const decoded = jwt.verify(token, "supersecretkey") as { id: string; email: string} // Usando a verificação de JWT do fastify
   
    request.user = {
      id: new mongoose.Types.ObjectId(decoded.id),
      email: decoded.email,
    };
 // Definindo o ID do usuário no request

    console.log("✅ Usuário autenticado com ID:", request.userId);
  } catch (error) {
    console.error("❌ Erro na autenticação:", error);
    return reply.status(401).send({ message: "Token inválido ou não fornecido!" });
  }
}

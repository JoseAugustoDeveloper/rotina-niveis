import fastify from "fastify";
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./controllers/authController";
import activityRoutes from "./controllers/activityController";
import userRoutes from "./controllers/userController";
import fastifyCookie from "@fastify/cookie"
import jwt, { JwtPayload } from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";
import fastifyCors from '@fastify/cors';

dotenv.config();

const app = fastify({ logger: true });

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

app.register(fastifyCookie, {
  secret:"supersecretkey"
});
app.register(authRoutes)
app.register(activityRoutes);
app.register(userRoutes);
app.register(fastifyCors, {
  origin: 'http://127.0.0.1:5500', // Permitir apenas seu front-end específico
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  credentials: true
});

const mongoUri = process.env.MONG_URI || "mongodb://localhost/rotina-niveis";
mongoose
  .connect(mongoUri)
  .then(() => app.log.info("✅ Conectado ao MongoDB!"))
  .catch(err => app.log.error("❌ Erro ao conectar ao MongoDB:", err));

  const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey"
 
  interface AuthTokenPayload extends JwtPayload {
    id: string;
    email: string;
  }

  declare module "fastify" {
    interface FastifyRequest {
      userId?: string;
    }
  }
  app.decorate("authenticate", async (request: FastifyRequest , reply: FastifyReply) => {
    const token = request.cookies.auth_token;
    try {
      const decoded = jwt.verify(token as string, SECRET_KEY ) as unknown as AuthTokenPayload;
      request.userId = decoded.id
    } catch (error) {
      reply.status(401).send({ message: "Token inválido ou não fornecido!"})
    }
  })
  


const start = async () => {
  try {
    const port = Number(process.env.PORT || 3000)
    await app.listen({ port, host: "0.0.0.0" });
    console.log("🚀 Servidor rodando em http://localhost:${port}")
  }
  catch (error) {
   app.log.error(error);
    process.exit(1)

  }
};

start();
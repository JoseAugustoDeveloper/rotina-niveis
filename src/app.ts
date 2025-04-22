import fastify from "fastify";
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./controllers/authController";
import userRoutes from "./controllers/userController";
import fastifyCookie from "@fastify/cookie"
import { JwtPayload } from "jsonwebtoken";
import fastifyCors from '@fastify/cors';
import { authenticate } from "./middlewares/authenticate";
import fastifyStatic from '@fastify/static';
import path from "node:path";




dotenv.config();

const app = fastify({ logger: true });
app.addContentTypeParser('multipart/form-data', function (request, payload, done) { done(null) })
app.register(fastifyCookie, {
  secret: "supersecretkey"
});
app.register(authRoutes);
app.register(userRoutes);
app.register(fastifyCors, {
  origin: '   http://localhost:5173', // Permitir apenas seu front-end específico
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  credentials: true
});
app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "uploads"),
  prefix: "/uploads/",
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


app.decorate("authenticate", authenticate as any)


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
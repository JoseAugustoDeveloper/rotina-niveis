import fastify from "fastify";
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./auth";
import activityRoutes from "./activity";


dotenv.config();

const app = fastify({ logger: true });

// app.get('/', async (request, reply) => {
//   return { message: "servidor rodando" }
// })

const mongoUri = process.env.MONG_URI || "mongodb://localhost/rotina-niveis";
mongoose
  .connect(mongoUri)
  .then(() => app.log.info("✅ Conectado ao MongoDB!"))
  .catch(err => app.log.error("❌ Erro ao conectar ao MongoDB:", err));

app.register(authRoutes)
app.register(activityRoutes);

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
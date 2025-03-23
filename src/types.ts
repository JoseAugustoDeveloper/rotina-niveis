import { FastifyRequest } from "fastify";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: mongoose.Types.ObjectId;
}

export interface JwtPayload {
  id: string;
}
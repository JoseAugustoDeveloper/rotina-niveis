import { FastifyRequest } from "fastify";
import mongoose from "mongoose";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: mongoose.Types.ObjectId;
      email: string;
    };
  }
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: mongoose.Types.ObjectId;
    email: string;
  };
}

export interface JwtPayload {
  id: string;
}
import type { FastifyInstance } from "fastify";
import { prisma } from "@adaptsec/db";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      service: "adaptsec-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch {
      return reply.status(503).send({
        status: "not_ready",
        database: "disconnected",
      });
    }
  });
}
